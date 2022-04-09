// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { memoize } from 'lodash';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { abi } from '../../config/abi';
import { entrance } from '../network';

export interface TokenCache {
  address: string;
  symbol: string;
  decimals: string;
  name: string;
  logo: string;
  erc20?: boolean;
}

const DEFAULT_SYMBOL = '';
const DEFAULT_DECIMALS = '18';