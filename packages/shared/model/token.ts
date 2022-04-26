import BN from 'bn.js';
import { RegisterStatus } from '../config/constant';

export interface Token<T = string> {
  name: string;
  symbol: T;
  decimals: string | number;
  address: string;
  logo: string;
}

export interface MappingToken extends Token {
  source: string;
  backing: string;
  status: RegisterStatus | null;
  balance: BN;
}

export type Erc20Token = MappingToken;
