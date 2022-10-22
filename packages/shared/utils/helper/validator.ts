import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { isAddress } from 'ethers/lib/utils';
import { Network, TokenWithBridgesInfo } from '../../model';
import { isEthereumNetwork, isPolkadotNetwork } from '../network/network';
import { canConvertToEth, convertToEth, convertToSS58, dvmAddressToAccountId } from './address';

// eslint-disable-next-line complexity
export const isValidAddress = (address: string, network: Network): boolean => {
  if (isEthereumNetwork(network)) {
    const isDvm = isAddress(address);
    const isSS58 = isSS58Address(address);

    return isDvm || (isSS58 && canConvertToEth(address));
  }

  if (isPolkadotNetwork(network)) {
    return isSS58Address(address);
  }

  return false;
};

export const isSS58Address = (address: string, ss58Prefix?: number) => {
  if (!address) {
    return false;
  }

  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : ss58Prefix
        ? decodeAddress(address, false, ss58Prefix)
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    return false;
  }
};

// eslint-disable-next-line complexity
export const isSameAddress = (from: string, to: string): boolean => {
  if (from === to) {
    return true;
  }

  let toAddress: string | null = to;
  let fromAddress: string = from;

  if (isAddress(from)) {
    try {
      toAddress = convertToEth(to);
    } catch (err) {
      console.warn(
        '%c [ file: src/utils/helper/validate.ts  ]- function: isSameAddress',
        'font-size:13px; background:pink; color:#bf2c9f;',
        (err as unknown as Record<string, string>).message
      );
    }
  }

  if (isSS58Address(from)) {
    if (isAddress(to)) {
      toAddress = dvmAddressToAccountId(to).toHuman() as string;
    }

    if (isSS58Address(to)) {
      toAddress = convertToSS58(to, 0);
      fromAddress = convertToSS58(from, 0);
    }
  }

  return fromAddress === toAddress;
};

export const isRing = (name: string | null | undefined) => /ring/i.test(String(name)) || /crab/i.test(String(name));

export const isNativeToken = (config: TokenWithBridgesInfo) => config.type === 'native';

export const isKton = (name: string | null | undefined) => /kton/i.test(String(name));
