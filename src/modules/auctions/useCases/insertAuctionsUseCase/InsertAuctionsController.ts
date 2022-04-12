import { Auction } from '@prisma/client';
import { transform } from '@utils/convertRawToAuction';
import { container } from 'tsyringe';

import { InsertAuctionsUseCase } from './InsertAuctionsUseCase';

export type RawAuction = {
  auction_id: string;
  seller: string;
  buyer: string;
  timestamp: number;
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

    const auctions: Auction[] = [];

    raw_auctions.forEach(async raw_auction => {
      if (!raw_auction.bin) return;

      auctions.push(await transform(raw_auction));
    });

    const response = await insertAuctionsUseCase.execute(auctions);

    return response;
  }
}
