import { TypeName } from './TypeName';

export interface NewDepositMade {
  coin_type: TypeName;
  amount: string;
}