import { Server } from 'socket.io';
import { request } from 'undici';

interface IResponse {
  lastUpdated: number;
  success: boolean;
  auctions: [];
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

    setTimeout(
      async () => {
        const { body } = await request(
          'https://ápi.hypixel.net/skyblock/auctions',
          {
            method: 'GET',
          },
        );

        const { auctions, lastUpdated, success }: IResponse = await body.json();

        if (!success) {
          this.#lastUpdated = undefined;

          await this.execute();
        } else {
          if (!this.#lastUpdated || lastUpdated > this.#lastUpdated) {
            this.#lastUpdated = lastUpdated;

            this.#socket.emit('NEW_AUCTIONS', auctions);
          }

          await this.execute();
        }
      },
      delay > 0 ? delay : 200,
    );
  };
}
