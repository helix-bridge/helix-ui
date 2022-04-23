import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import BN from 'bn.js';
import type { ValidatorRule } from 'rc-field-form/lib/interface';
import { TFunction } from 'react-i18next';
import Web3 from 'web3';
import { Network, NetworkCategory, PolkadotChainConfig, PolkadotTypeNetwork, Token } from '../../model';
import { isPolkadotNetwork, NETWORK_CONFIGURATIONS } from '../network/network';
import { canConvertToEth, convertToEth, convertToSS58, dvmAddressToAccountId } from './address';
import { toWei } from './balance';

// eslint-disable-next-line complexity
export const isValidAddress = (address: string, network: Network | NetworkCategory): boolean => {
  if (network === 'ethereum') {
    const isDvm = Web3.utils.isAddress(address);
    const isSS58 = isSS58Address(address);

    return isDvm || (isSS58 && canConvertToEth(address));
  }

  if (isPolkadotNetwork(network as PolkadotTypeNetwork)) {
    return isSS58Address(address);
  }

  if (network === 'tron') {
    return window.tronWeb && window.tronWeb.isAddress(address);
  }

  return false;
};

// eslint-disable-next-line complexity
export const isValidAddressStrict = (address: string, network: Network | NetworkCategory): boolean => {
  if (network === 'ethereum') {
    return Web3.utils.isAddress(address);
  }

  if (network === 'polkadot') {
    return isSS58Address(address, 0);
  }

  if (isPolkadotNetwork(network as PolkadotTypeNetwork)) {
    const target = NETWORK_CONFIGURATIONS.find((item) => item.name === network) as PolkadotChainConfig;

    return isSS58Address(address, target.ss58Prefix);
  }

  if (network === 'tron') {
    return window.tronWeb && window.tronWeb.isAddress(address);
  }

  return false;
};

// eslint-disable-next-line complexity
export const isSS58Address = (address: string, ss58Prefix?: number) => {
  const len = 48;

  if (!address || address.length < len) {
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

  if (Web3.utils.isAddress(from)) {
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
    if (Web3.utils.isAddress(to)) {
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

export const isKton = (name: string | null | undefined) => /kton/i.test(String(name));

export const isDeposit = (name: string | null | undefined) => /deposit/i.test(String(name));

/* ------------------------------------Form Validators------------------------------------- */

export type Validator = ValidatorRule['validator'];

export interface ValidateOptions {
  t: TFunction;
  compared?: string | BN | number | null;
  token?: Token;
  asset?: string;
}

export type ValidatorFactory = (options: ValidateOptions) => Validator;

export type ValidatorRuleFactory = (options: ValidateOptions) => ValidatorRule;

const zeroAmountValidator: Validator = (_o, val) => {
  return new BN(val).isZero() ? Promise.reject() : Promise.resolve();
};

export const zeroAmountRule: ValidatorRuleFactory = (options) => {
  const { t } = options;

  return { validator: zeroAmountValidator, message: t('The transfer amount must great than 0') };
};

const amountLessThanFeeValidatorFactory: ValidatorFactory = (options) => (_, val) => {
  const { token, compared: fee, asset } = options;

  if (!fee) {
    return Promise.reject();
  }

  const { decimal = 'gwei' } = token || {};
  const cur = new BN(toWei({ value: val, unit: decimal }));
  let pass = true;

  if (isRing(asset)) {
    pass = cur.gte(new BN(fee));
  }

  return pass ? Promise.resolve() : Promise.reject();
};

export const amountLessThanFeeRule: ValidatorRuleFactory = (options) => {
  const { t } = options;
  const validator = amountLessThanFeeValidatorFactory(options);

  return { validator, message: t('The transfer amount is not enough to cover the fee') };
};

const insufficientBalanceValidatorFactory: ValidatorFactory = (options) => (_, val) => {
  const { compared = '0', token } = options;
  const max = new BN(compared as string);
  const value = new BN(toWei({ value: val, unit: token?.decimal ?? 'gwei' }));

  return value.gt(max) ? Promise.reject() : Promise.resolve();
};

export const insufficientBalanceRule: ValidatorRuleFactory = (options) => {
  const { t } = options;
  const validator = insufficientBalanceValidatorFactory(options);

  return { validator, message: t('Insufficient balance') };
};

export const invalidFeeRule: ValidatorRuleFactory = (options) => {
  const { t, compared } = options;

  return {
    validator: () => {
      return !compared || new BN(compared).lt(new BN(0)) ? Promise.reject() : Promise.resolve();
    },
    message: t('Can not verify amount because of invalid fee'),
  };
};

export const insufficientDailyLimit: ValidatorRuleFactory = (options) => {
  const { t } = options;
  const validator = insufficientBalanceValidatorFactory(options);

  return { validator, message: t('Insufficient transfer amount today') };
};
