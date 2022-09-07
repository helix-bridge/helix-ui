/* eslint-disable no-magic-numbers */
import { TypeRegistry } from '@polkadot/types';
import type { Codec, DetectCodec } from '@polkadot/types/types';
import { hexToU8a, numberToU8a, stringToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { isAddress } from 'ethers/lib/utils';
import isNull from 'lodash/isNull';
import { ChainConfig, PolkadotChainConfig } from '../../model';
import { isDVMNetwork, isPolkadotNetwork } from '../network';

export const registry = new TypeRegistry();

export function dvmAddressToAccountId(address: string | null | undefined): DetectCodec<Codec, string> {
  if (!address || !isAddress(address)) {
    return registry.createType('AccountId', '');
  }

  const data = new Uint8Array(32);

  data.set(stringToU8a('dvm:'));
  data.set(hexToU8a(address), 11);
  // eslint-disable-next-line no-bitwise
  const checksum = data.reduce((pre: number, current: number): number => pre ^ current);

  data.set(numberToU8a(checksum), 31);

  const accountId = registry.createType('AccountId', data);

  return accountId;
}

export function convertToSS58(text: string, prefix: number | null): string {
  if (!text || isNull(prefix)) {
    return '';
  }

  try {
    const address = encodeAddress(text, prefix);

    return address;
  } catch (error) {
    return '';
  }
}

export function convertToDvm(address: string): string {
  if (!address) {
    return '';
  }

  return u8aToHex(decodeAddress(address));
}

export function canConvertToEth(address: string): boolean {
  return !!convertToEth(address);
}

export function convertToEth(address: string): string | null {
  if (!address) {
    return '';
  }

  const startAt = 2;
  const result = u8aToHex(decodeAddress(address)).slice(startAt);
  const PREFIX = '64766d3a00000000000000';

  // eslint-disable-next-line no-magic-numbers
  return result.startsWith(PREFIX) ? '0x' + result.slice(-42, -2) : null;
}

export function remove0x(text: string): string {
  const start = 2;

  if (text.slice(0, start) === '0x') {
    return text.slice(start);
  }
  return text;
}

// eslint-disable-next-line complexity
export function revertAccount(account: string, config: ChainConfig): string {
  if (isPolkadotNetwork(config.name) || config?.wallets.includes('polkadot')) {
    return convertToSS58(account, (<PolkadotChainConfig>config).ss58Prefix);
  }

  if (isDVMNetwork(config.name) && account.startsWith('0x64766d3a00000000000000')) {
    return convertToEth(account) ?? account;
  }

  return account;
}
