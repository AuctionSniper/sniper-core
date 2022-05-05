import { prisma } from '@database/prismaClient';
import { ProfitableAuction } from '@modules/auctions/data/ProfitableAuction';
import { RawAuction } from '@modules/auctions/data/RawAuction';
import { checkAll } from '@utils/checkItemProfit';
import { getItemsID } from '@utils/convertBytesToNBT';
import { map as filterKeys } from 'lodash';
import log from 'log-beautify';
import { injectable } from 'tsyringe';

interface IRequest {
  auctions: RawAuction[];
}

@injectable()
export class SearchProfitUseCase {
  async execute({ auctions }: IRequest): Promise<ProfitableAuction[]> {
    const items_id = await getItemsID(filterKeys(auctions, 'item_bytes'));

    const auctions_view = await prisma.auctionView.findMany({
      where: {
        id: {
          in: items_id,
        },
      },
    });

    const profitable_auctions = await checkAll(auctions, auctions_view);

    log.success(`Found ${profitable_auctions.length} profitable auctions.`);

    return profitable_auctions;
  }
}
