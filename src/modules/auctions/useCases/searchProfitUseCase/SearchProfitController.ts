import { transformAll } from '@utils/convertRawToAuction';
import { container } from 'tsyringe';

import { RawAuction } from '../insertAuctionsUseCase/InsertAuctionsController';
import { IProfitableAuction, SearchProfitUseCase } from './SearchProfitUseCase';

interface IRequest {
  raw_auctions: RawAuction[];
}

export class SearchProfitController {
  async handle({ raw_auctions }: IRequest): Promise<IProfitableAuction[]> {
    const validAuctions = await transformAll(raw_auctions);

    const searchProfitUseCase = container.resolve(SearchProfitUseCase);

    const auctions = await searchProfitUseCase.execute({
      auctions: validAuctions,
    });

    return auctions;
  }
}
