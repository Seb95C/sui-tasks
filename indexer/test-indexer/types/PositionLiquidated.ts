import { TypeName } from './TypeName';

export interface PositionLiquidated {
  liquidated_user: string;
  liquidator: string;
  debt_covered: string;
  collateral_type: TypeName;
  collateral_amount: string;
}