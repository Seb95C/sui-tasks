import { TypeName } from './TypeName';

export interface PriceFetched {
  coin_type: TypeName;
  price: string;
  decimal: number;
  round: string;
}