import { Extra } from '@utils/convertBytesToNBT';

export type ProfitableAuction = {
  item_id: string;
  auction_id: string;
  price: number;
  extra: Extra;
  profit: number;
  profit_percentage: number;
};
