import log from 'log-beautify';
import { Server } from 'socket.io';
import { request } from 'undici';

import { RawAuction } from '../data/RawAuction';
import { SearchProfitController } from '../useCases/searchProfitUseCase/SearchProfitController';

type AuctionResponse = {
  uuid: string;
  starting_bid: number;
  bin: boolean;
  item_bytes: string;
};

interface IResponse {
  lastUpdated: number;
  success: boolean;
  auctions: AuctionResponse[];
}

export class SearchAuctionsTask {
  #socket: Server;
  #lastUpdated: number;

  constructor(socket: Server) {
    this.#socket = socket;
  }

  execute = async () => {
    const delay =
      this.#lastUpdated === undefined
        ? 0
        : this.#lastUpdated + 1000 * 60 - Date.now();

    log.warning(`Searching auctions in ${delay / 1000} seconds.`);

    setTimeout(
      async () => {
        const { body } = await request(
          'https://api.hypixel.net/skyblock/auctions',
          {
            method: 'GET',
          },
        );

        const { auctions, lastUpdated, success }: IResponse = await body.json();

        if (!success) {
          this.#lastUpdated = undefined;

          log.error('Failed to fetch auctions, trying again.');

          await this.execute();
        } else {
          if (!this.#lastUpdated || lastUpdated > this.#lastUpdated) {
            this.#lastUpdated = lastUpdated;

            const filteredAuctions = auctions
              .filter(auction => auction.bin)
              .map(auction => ({
                auction_id: auction.uuid,
                price: auction.starting_bid,
                item_bytes: auction.item_bytes,
                bin: auction.bin,
              }));

            log.info(`Found ${filteredAuctions.length} auctions.`);

            const searchProfitController = new SearchProfitController();

            const profitableAuctions = await searchProfitController.handle({
              raw_auctions: filteredAuctions,
            });

            console.table(profitableAuctions);

            this.#socket.emit('NEW_AUCTIONS', profitableAuctions);
          }

          await this.execute();
        }
      },
      delay > 0 ? delay : 750,
    );
  };
}
