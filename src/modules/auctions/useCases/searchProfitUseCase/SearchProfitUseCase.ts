import { Auction } from '@prisma/client';
import { injectable } from 'tsyringe';

interface IRequest {
  auctions: Auction[];
}

export interface IProfitableAuction {
  id: number;
}

@injectable()
export class SearchProfitUseCase {
  async execute({ auctions }: IRequest): Promise<IProfitableAuction[]> {
    return [];
  }
}
