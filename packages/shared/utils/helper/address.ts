/* eslint-disable no-magic-numbers */
import { TypeRegistry } from '@polkadot/types';
import type { Codec, DetectCodec } from '@polkadot/types/types';
import { hexToU8a, numberToU8a, stringToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { isNull } from 'lodash';
import Web3 from 'web3';

export const registry = new TypeRegistry();

export function dvmAddressToAccountId(address: string | null | undefined): DetectCodec<Codec, string> {
  if (!address || !Web3.utils.isAddress(address)) {
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

/**
 * @param isShort deprecate, use css to implement
 */
export function convertToSS58(text: string, prefix: number | null, isShort = false): string {
  if (!text || isNull(prefix)) {
    return '';
  }

  try {
    let address = encodeAddress(text, prefix);
    const length = 8;

    if (isShort) {
      address = address.slice(0, length) + '...' + address.slice(address.length - length, length);
    }

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
