import Bignumber from 'bignumber.js';
import Web3 from 'web3';
import { HelixHistoryRecord } from '../../model';
import {
  isDVM2Substrate,
  isEthereum2CrabDVM,
  isEthereum2Darwinia,
  isEthereumHeco,
  isEthereumPolygon,
  isHeco2CrabDVM,
  isParachain2Substrate,
  isPolygon2CrabDVM,
  isSubstrateDVM,
  isSubstrateDVM2Substrate,
  isSubstrateDVMSubstrateDVM,
} from '../bridge';
import { fromWei, prettyNumber } from '../helper';
import { getChainConfig, isEthereumNetwork } from '../network';

export function getTokenSymbolFromHelixRecord(
  record: HelixHistoryRecord,
  key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'token'> = 'token'
) {
  const { token } = record;
  const fromChain = getChainConfig(record.fromChain);

  let symbol = record[key];

  if (Web3.utils.isAddress(token)) {
    const target = fromChain.tokens.find((item) => item.address.toLowerCase() === token.toLowerCase());

    symbol = target?.symbol ?? '';
  }

  if (!symbol) {
    console.warn(`🚨 Can not find token with address ${token} on chain ${fromChain.name}`);
  }

  return symbol;
}

/**
 * TODO: refactor it to calc by token config info
 */
export function getReceivedAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, toChain } = record;
  const predicates = [
    isDVM2Substrate,
    isParachain2Substrate,
    isEthereum2Darwinia,
    isHeco2CrabDVM,
    isPolygon2CrabDVM,
    isEthereum2CrabDVM,
    isEthereumHeco,
    isEthereumPolygon,
    isSubstrateDVMSubstrateDVM,
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
  const predicates = [isSubstrateDVM, isSubstrateDVM2Substrate, isSubstrateDVMSubstrateDVM];

  try {
    const result = predicates.some((fn) => fn(record.fromChain, record.toChain))
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
