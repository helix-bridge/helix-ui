// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import contractMap from '@metamask/contract-metadata';
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

async function getTokenMeta(tokenAddress: string, contractAbi: AbiItem[]): Promise<TokenCache> {
  if (contractMap[tokenAddress]) {
    return contractMap[tokenAddress];
  }

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(contractAbi, tokenAddress);
  const symbol = await contract.methods.symbol().call();
  const decimals = await contract.methods.decimals().call();
  const name = await contract.methods.name().call();

  return {
    address: tokenAddress,
    symbol: symbol ?? DEFAULT_SYMBOL,
    decimals: decimals.toString() ?? DEFAULT_DECIMALS,
    name: name ?? '',
    logo: '',
  };
}

async function erc20TokenMeta(tokenAddress: string): Promise<TokenCache> {
  return getTokenMeta(tokenAddress, abi.Erc20ABI);
}

async function mappingTokenMeta(tokenAddress: string): Promise<TokenCache> {
  const { symbol, name, ...rest } = await getTokenMeta(tokenAddress, abi.tokenABI);

  return { ...rest, symbol: Web3.utils.hexToString(symbol), name: Web3.utils.hexToString(name) };
}

export const getErc20Meta = memoize(erc20TokenMeta);

export const getMappingTokenMeta = memoize(mappingTokenMeta);
