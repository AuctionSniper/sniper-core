import { ProfitableAuction } from '@modules/auctions/data/ProfitableAuction';
import { RawAuction } from '@modules/auctions/data/RawAuction';
import { container } from 'tsyringe';

import { SearchProfitUseCase } from './SearchProfitUseCase';

interface IRequest {
  raw_auctions: RawAuction[];
}

export class SearchProfitController {
  async handle({ raw_auctions }: IRequest): Promise<ProfitableAuction[]> {
    const searchProfitUseCase = container.resolve(SearchProfitUseCase);

    const auctions = await searchProfitUseCase.execute({
      auctions: raw_auctions,
    });

    return auctions;
  }
}
