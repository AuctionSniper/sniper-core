import { prisma } from '@database/prismaClient';
import { Auction } from '@prisma/client';
import { map as filterKeys } from 'lodash';
import log from 'log-beautify';
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
    const findMany = await prisma.auctionView.findMany({
      where: {
        id: {
          in: filterKeys(auctions, 'item_id'),
        },
      },
    });

    log.success(`Found ${findMany.length} profitable auctions.`);

    return [];
  }
}
