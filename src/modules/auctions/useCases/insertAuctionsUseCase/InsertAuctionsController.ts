import { transformAll } from '@utils/convertRawToAuction';
import log from 'log-beautify';
import { container } from 'tsyringe';

import { InsertAuctionsUseCase } from './InsertAuctionsUseCase';

export type RawAuction = {
  auction_id: string;
  bin: boolean;
  price: number;
  item_bytes: string;
};

interface IRequest {
  auctions: RawAuction[];
}

export class InsertAuctionsController {
  async handle({ auctions: raw_auctions }: IRequest) {
    const insertAuctionsUseCase = container.resolve(InsertAuctionsUseCase);

    const auctions = await transformAll(
      raw_auctions.filter(raw => {
        return raw.bin && raw.price >= 500000;
      }),
    );

    log.info(
      `${raw_auctions.length - auctions.length} auctions removed by filter.`,
    );

    const response = await insertAuctionsUseCase.execute(auctions);

    log.success(`Saved ${response.count} auctions.`);

    return response;
  }
}
