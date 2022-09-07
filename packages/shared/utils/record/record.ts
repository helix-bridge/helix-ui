import { isAddress } from 'ethers/lib/utils';
import { RecordStatus } from '../../config/constant';
import { HelixHistoryRecord, TokenWithBridgesInfo } from '../../model';
import { fromWei, prettyNumber } from '../helper';
import { getOriginChainConfig, isPolkadotNetwork } from '../network';

export function getTokenConfigFromHelixRecord(
  record: HelixHistoryRecord,
  key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'sendToken' | 'recvToken'> = 'sendToken'
): TokenWithBridgesInfo {
  const chain = getOriginChainConfig(record[key === 'recvToken' ? 'toChain' : 'fromChain']);
  const symbol = record[key];

  return chain.tokens.find((item) => {
    if (isAddress(symbol)) {
      return item.address.toLowerCase() === symbol.toLowerCase();
    }
    const isSameSymbol = item.symbol === symbol;

    if (!isSameSymbol) {
      const isSameSymbolCaseInsensitive = item.symbol.toLowerCase() === symbol.toLowerCase();

      if (isSameSymbolCaseInsensitive) {
        console.warn(
          `⚠️ Token symbol(${symbol}) from ${record.id} is not consistent with the symbol(${item.symbol}) stored in ${chain.name} configuration!`
        );
        return true;
      }
    }

    return isSameSymbol;
  })!;
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
  const fromConfig = getOriginChainConfig(fromChain);
  const token = fromConfig.tokens.find((item) => item.symbol === feeToken)!;
  let decimals = token?.decimals;

  if (!decimals) {
    decimals = isPolkadotNetwork(fromChain) && !fromChain.includes('parachain') ? 9 : 18;
  }

  return fromWei({ value: record.fee, decimals });
}

export function getSentAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, sendToken, sendAmount } = record;
  const fromToken = getOriginChainConfig(fromChain)!.tokens.find((item) => item.symbol === sendToken);

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

export function isXCMRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('xcm');
}
