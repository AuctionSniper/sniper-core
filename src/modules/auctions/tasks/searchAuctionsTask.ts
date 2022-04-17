import log from 'log-beautify';
import { Server } from 'socket.io';
import { request } from 'undici';

import { RawAuction } from '../useCases/insertAuctionsUseCase/InsertAuctionsController';
import { SearchProfitController } from '../useCases/searchProfitUseCase/SearchProfitController';

interface IResponse {
  lastUpdated: number;
  success: boolean;
  auctions: RawAuction[];
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

            const filteredAuctions = auctions.filter(auction => auction.bin);

            log.info(`Found ${filteredAuctions.length} auctions.`);

            const searchProfitController = new SearchProfitController();

            const profitableAuctions = await searchProfitController.handle({
              raw_auctions: filteredAuctions,
            });

            this.#socket.emit('NEW_AUCTIONS', profitableAuctions);
          }

          await this.execute();
        }
      },
      delay > 0 ? delay : 750,
    );
  };
}
