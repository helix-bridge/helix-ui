import Bignumber from 'bignumber.js';
import { HelixHistoryRecord } from '../../model';
import { isDVM2Substrate, isEthereum2Darwinia, isParachain2Substrate } from '../bridge';
import { fromWei, prettyNumber } from '../helper';
import { getChainConfig, isDVMNetwork } from '../network';

export function getTokenNameFromHelixRecord(record: HelixHistoryRecord) {
  const chainConfig = getChainConfig(record.fromChain);

  return !record.token.startsWith('0x')
    ? record.token
    : `${isDVMNetwork(record.fromChain) ? 'x' : ''}${chainConfig?.isTest ? 'O' : ''}RING`;
}

export function getSendAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, toChain } = record;

  return fromWei(
    {
      value: record.amount,
      decimals:
        isDVM2Substrate(fromChain, toChain) ||
        isParachain2Substrate(fromChain, toChain) ||
        isEthereum2Darwinia(fromChain, toChain)
          ? 18
          : 9,
    },
    (val) => prettyNumber(val, { ignoreZeroDecimal: true })
  );
}

export function getFeeAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain } = record;
  const decimals = isDVMNetwork(fromChain) || fromChain.includes('parachain') ? 18 : 9;

  return fromWei({ value: record.fee, decimals });
}

export function getReceiveAmountFromHelixRecord(record: HelixHistoryRecord) {
  const sendAmount = getSendAmountFromHelixRecord(record);
  const token = getTokenNameFromHelixRecord(record);
  const feeAmount = getFeeAmountFromHelixRecord(record);

  try {
    return token !== record.feeToken
      ? sendAmount
      : new Bignumber(sendAmount).minus(new Bignumber(feeAmount)).toString();
  } catch (err) {
    console.log('🚀 ~ file: record.ts ~ line 36 ~ getReceiveAmountFromHelixRecord ~ sendAmount', sendAmount, record);

    return 'NaN';
  }
}
