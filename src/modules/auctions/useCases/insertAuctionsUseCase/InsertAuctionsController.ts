import { Auction } from '@prisma/client';
import { container } from 'tsyringe';

import { InsertAuctionsUseCase } from './InsertAuctionsUseCase';

export class InsertAuctionsController {
  async handle() {
    const auctions: Auction[] = [];

    const insertAuctionsUseCase = container.resolve(InsertAuctionsUseCase);

    const response = await insertAuctionsUseCase.execute(auctions);

    return response;
  }
}
