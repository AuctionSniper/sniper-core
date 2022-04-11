import { prisma } from '@database/prismaClient';
import { Auction } from '@prisma/client';
import { injectable } from 'tsyringe';

@injectable()
export class InsertAuctionsUseCase {
  async execute(data: Auction[]) {
    const response = await prisma.auction.createMany({
      data,
    });

    return response;
  }
}
