import { TypeName } from './TypeName';

export interface CoinAdded {
  coin_type: TypeName;
  price_feed_index: number;
  decimals: number;
}