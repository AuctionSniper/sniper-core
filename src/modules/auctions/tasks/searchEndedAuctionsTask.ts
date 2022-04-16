import log from 'log-beautify';
import { request } from 'undici';

import {
  InsertAuctionsController,
  RawAuction,
} from '../useCases/insertAuctionsUseCase/InsertAuctionsController';

interface IResponse {
  success: boolean;
  lastUpdated: number;
  auctions: RawAuction[];
}

export class SearchEndedAuctionsTask {
  #insertAuctionsController: InsertAuctionsController;
  #lastUpdated: number;

  constructor() {
    this.#insertAuctionsController = new InsertAuctionsController();
  }

  execute = async () => {
    setInterval(async () => {
      const { body } = await request(
        'https://api.hypixel.net/skyblock/auctions_ended',
        {
          method: 'GET',
        },
      );

      const { success, lastUpdated, auctions }: IResponse = await body.json();

      if (this.#lastUpdated !== lastUpdated && success && auctions) {
        this.#lastUpdated = lastUpdated;

        log.info(`Found: ${auctions.length} auctions.`);

        this.#insertAuctionsController.handle({
          auctions,
        });
      }
    }, 45 * 1000);
  };
}
