import Bignumber from 'bignumber.js';
import { HelixHistoryRecord } from '../../model';
import {
  isDVM2Substrate,
  isEthereum2CrabDVM,
  isEthereum2Darwinia,
  isHeco2CrabDVM,
  isParachain2Substrate,
  isPolygon2CrabDVM,
  isSubstrateDVM,
  isSubstrateDVM2Substrate,
} from '../bridge';
import { fromWei, prettyNumber } from '../helper';
import { getChainConfig, isDVMNetwork, isEthereumNetwork } from '../network';

export function getTokenNameFromHelixRecord(record: HelixHistoryRecord) {
  const chainConfig = getChainConfig(record.fromChain);

  return !record.token.startsWith('0x')
    ? record.token
    : `${isDVMNetwork(record.fromChain) ? 'x' : ''}${chainConfig?.isTest ? 'O' : ''}RING`;
}

export function getReceivedAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, toChain } = record;
  const predicates = [
    isDVM2Substrate,
    isParachain2Substrate,
    isEthereum2Darwinia,
    isHeco2CrabDVM,
    isPolygon2CrabDVM,
    isEthereum2CrabDVM,
  ];

  return fromWei(
    {
      value: record.amount,
      decimals: predicates.some((fn) => fn(fromChain, toChain)) ? 18 : 9,
    },
    (val) => prettyNumber(val, { ignoreZeroDecimal: true })
  );
}

export function getFeeAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain } = record;
  const decimals = isEthereumNetwork(fromChain) || fromChain.includes('parachain') ? 18 : 9;

  return fromWei({ value: record.fee, decimals });
}

export function getSentAmountFromHelixRecord(record: HelixHistoryRecord) {
  const receive = getReceivedAmountFromHelixRecord(record);
  const receivedAmount = receive.replace(/,/g, '');
  const feeAmount = getFeeAmountFromHelixRecord(record);

  try {
    const result =
      isSubstrateDVM(record.fromChain, record.toChain) || isSubstrateDVM2Substrate(record.fromChain, record.toChain)
        ? receivedAmount
        : new Bignumber(receivedAmount).plus(new Bignumber(feeAmount)).toString();

    if (+result < 0) {
      throw new Error(`Record ${record.id}, sendAmount: ${receivedAmount}, calculate received amount: ${result}`);
    }

    return prettyNumber(result, { ignoreZeroDecimal: true });
  } catch (err) {
    console.error((err as unknown as Error).message);

    return 'NaN';
  }
}
