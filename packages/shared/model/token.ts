import BN from 'bn.js';
import { RegisterStatus } from '../config/constant';

export interface Token<T = string> {
  /**
   * make sure the name is unique; we use it to identify the tokens.
   * The symbol field maybe repeat between different chains, e.g: ethereum and ropsten, have a common symbol 'ether'
   */
  name: string;
  symbol: T;
  decimals: number;
  address: string;
  logo: string;
  extra?: { [key: string]: unknown };
}

export interface MappingToken extends Token {
  source: string;
  backing: string;
  status: RegisterStatus | null;
  balance: BN;
}

export type Erc20Token = MappingToken;
