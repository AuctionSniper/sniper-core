import { AuctionViewItem } from '@modules/auctions/data/AuctionViewItem';
import { ProfitableAuction } from '@modules/auctions/data/ProfitableAuction';
import { RawAuction } from '@modules/auctions/data/RawAuction';
import { Auction, AuctionView } from '@prisma/client';

import { Extra, isClean } from './convertBytesToNBT';
import { transform } from './convertRawToAuction';
import { percentageBetween } from './misc';

type Data = {
  items: AuctionViewItem[];
  lowest_bin: number;
};

async function checkPrice(item: Auction, data: Data): Promise<number> {
  return 0;
}

export async function check(
  rawItem: RawAuction,
  auctions: AuctionView[],
): Promise<ProfitableAuction> {
  const item = await transform(rawItem);

  const match = auctions.find(auction => auction.id === item.item_id);

  if (match) {
    const items = match.items as AuctionViewItem[];

    let { price } =
      items.filter(item => isClean(item.extra as Extra))[0] ?? items[0];

    if (isClean(item.extra as Extra) && item.price > price) {
      return undefined;
    }

    price = await checkPrice(item, {
      items,
      lowest_bin: price,
    });

    if (price === 0) {
      price = items[0].price;
    }

    return {
      item_id: item.item_id,
      auction_id: rawItem.auction_id,
      price,
      extra: item.extra as Extra,
      profit: 0,
      profit_percentage: 0,
    };
  }
  return undefined;
}

export async function checkAll(
  items: RawAuction[],
  auctions: AuctionView[],
): Promise<ProfitableAuction[]> {
  const profitable_auctions = [];

  await Promise.all(
    items.map(async item => {
      const profitable_auction = await check(item, auctions);

      if (profitable_auction !== undefined) {
        profitable_auctions.push(profitable_auction);
      }
    }),
  );

  return profitable_auctions;
}
