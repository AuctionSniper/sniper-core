import { RawAuction } from '@modules/auctions/data/RawAuction';
import { transformAll } from '@utils/convertRawToAuction';
import log from 'log-beautify';
import { container } from 'tsyringe';

import { InsertAuctionsUseCase } from './InsertAuctionsUseCase';

interface IRequest {
  auctions: RawAuction[];
}

export class InsertAuctionsController {
  async handle({ auctions: raw_auctions }: IRequest) {
    const insertAuctionsUseCase = container.resolve(InsertAuctionsUseCase);

    const auctions = await transformAll(
      raw_auctions.filter(raw => {
        return raw.price >= 500000;
      }),
    );

    log.warn(
      `${raw_auctions.length - auctions.length} auctions removed by filter.`,
    );

    const response = await insertAuctionsUseCase.execute(auctions);

    log.success(`Saved ${response.count} auctions.`);

    return response;
  }
}
