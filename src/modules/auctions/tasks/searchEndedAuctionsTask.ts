import { Auction } from '@prisma/client';
import { request } from 'undici';

import { InsertAuctionsController } from '../useCases/insertAuctionsUseCase/InsertAuctionsController';

interface IResponse {
  success: boolean;
  lastUpdated: number;
  auctions: Auction[];
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

        this.#insertAuctionsController.handle({
          auctions,
        });
      }
    }, 15 * 1000);
  };
}
