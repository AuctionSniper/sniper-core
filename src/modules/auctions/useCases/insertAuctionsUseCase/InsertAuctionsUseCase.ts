import { prisma } from '@database/prismaClient';
import { Auction } from '@prisma/client';
import { injectable } from 'tsyringe';

@injectable()
export class InsertAuctionsUseCase {
  async execute(data: Auction[]) {
    const response = await prisma.auction.createMany({
      data,
    });

    await prisma.auction.aggregateRaw({
      pipeline: [
        {
          $sort: {
            price: 1,
          },
        },
        {
          $group: {
            _id: '$item_id',
            items: {
              $push: {
                price: '$price',
                extra: '$extra',
              },
            },
          },
        },
        {
          $merge: {
            into: 'AuctionView',
            on: '_id',
            whenMatched: 'replace',
            whenNotMatched: 'insert',
          },
        },
      ],
      options: {
        allowDiskUse: true,
        cursor: {
          batchSize: 0,
        },
      },
    });

    return response;
  }
}
