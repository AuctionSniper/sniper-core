import { RawAuction } from '@modules/auctions/useCases/insertAuctionsUseCase/InsertAuctionsController';
import { Auction } from '@prisma/client';

import { convert } from './convertBytesToNBT';

export async function transform(raw: RawAuction): Promise<Auction> {
  const [slug, extra] = await convert(raw.item_bytes);

  return {
    id: raw.auction_id,
    seller: raw.seller,
    buyer: raw.buyer,
    timestamp: new Date(raw.timestamp),
    price: raw.price,
    item_id: slug,
    extra,
  };
}

export async function transformAll(raws: RawAuction[]): Promise<Auction[]> {
  const auctions: Auction[] = [];

  await Promise.all(
    raws.map(async raw => {
      const auction = await transform(raw);

      auctions.push(auction);
    }),
  );

  return auctions;
}
