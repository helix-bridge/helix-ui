import BN from 'bn.js';
import { Units } from 'web3-utils';
import { RegisterStatus } from '../config/constant';

export interface Token<T = string> {
  symbol: T;
  decimal: keyof Units;
}

export interface MappingToken {
  address: string;
  source: string;
  backing: string;
  symbol: string;
  decimals: string | number;
  name: string;
  logo: string;
  status: RegisterStatus | null;
  balance: BN;
}

export type Erc20Token = MappingToken;
