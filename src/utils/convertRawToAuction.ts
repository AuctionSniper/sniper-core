import { RawAuction } from '@modules/auctions/useCases/insertAuctionsUseCase/InsertAuctionsController';
import { Auction } from '@prisma/client';

export function transform(raw: RawAuction): Auction {
  return {
    id: raw.auction_id,
    seller: raw.seller,
    buyer: raw.buyer,
    timestamp: new Date(raw.timestamp),
    price: raw.price,
    item_id: '',
    extra: [],
  };
}
