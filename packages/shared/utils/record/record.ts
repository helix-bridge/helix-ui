import Web3 from 'web3';
import { RecordStatus } from '../../config/constant';
import { HelixHistoryRecord, TokenWithBridgesInfo } from '../../model';
import { fromWei, prettyNumber } from '../helper';
import { getChainConfig, isPolkadotNetwork } from '../network';

export function getTokenConfigFromHelixRecord(
  record: HelixHistoryRecord,
  key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'sendToken' | 'recvToken'> = 'sendToken'
): TokenWithBridgesInfo | null {
  const chain = getChainConfig(record[key === 'recvToken' ? 'toChain' : 'fromChain']);
  const symbol = record[key];

  if (!symbol) {
    return null;
  }

  return chain.tokens.find((item) =>
    Web3.utils.isAddress(symbol) ? item.address.toLowerCase() === symbol.toLowerCase() : item.symbol === symbol
  )!;
}

export function getReceivedAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { result } = record;
  const fromToken = getTokenConfigFromHelixRecord(record)!;
  const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');

  let decimals = toToken?.decimals;

  if (result === RecordStatus.refunded) {
    decimals = fromToken.decimals;
  }

  return fromWei({ value: record.recvAmount, decimals }, (val) => prettyNumber(val, { ignoreZeroDecimal: true }));
}

export function getFeeAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, feeToken } = record;
  const fromConfig = getChainConfig(fromChain);
  const token = fromConfig.tokens.find((item) => item.symbol === feeToken)!;
  let decimals = token?.decimals;

  if (!decimals) {
    decimals = isPolkadotNetwork(fromChain) && !fromChain.includes('parachain') ? 9 : 18;
  }

  return fromWei({ value: record.fee, decimals });
}

export function getSentAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, sendToken, sendAmount } = record;
  const fromToken = getChainConfig(fromChain)!.tokens.find((item) => item.symbol === sendToken);

  return fromWei({ value: sendAmount, decimals: fromToken?.decimals }, (val) =>
    prettyNumber(val, { ignoreZeroDecimal: true })
  );
}

export function isHelixRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('helix');
}

export function isCBridgeRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('cbridge');
}
