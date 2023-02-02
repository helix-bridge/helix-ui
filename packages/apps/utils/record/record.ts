import { isAddress } from 'ethers/lib/utils';
import { RecordStatus } from 'shared/config/constant';
import { CrossChainDirection, HelixHistoryRecord, TokenWithBridgesInfo } from 'shared/model';
import { fromWei, prettyNumber, removeHelixFlag } from 'shared/utils/helper/balance';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { getOriginChainConfig } from '../network';

export function getTokenConfigFromHelixRecord(
  record: HelixHistoryRecord,
  key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'sendToken' | 'recvToken'>
): TokenWithBridgesInfo | undefined {
  const chain = getOriginChainConfig(record[key === 'recvToken' ? 'toChain' : 'fromChain']);
  const symbol = record[key];

  return chain.tokens.find((item) => {
    if (isAddress(symbol)) {
      return item.address.toLowerCase() === symbol.toLowerCase();
    }
    const isSameSymbol = item.symbol === symbol;

    if (!isSameSymbol) {
      const isSameSymbolCaseInsensitive = item.symbol.toLowerCase() === symbol.toLowerCase();
      const isInAlias = item.symbolAlias?.includes(symbol);

      if (isSameSymbolCaseInsensitive) {
        console.log(
          `⚠️ Token symbol(${symbol}) from ${record.id} is not consistent with the symbol(${item.symbol}) stored in ${chain.name} configuration!`
        );
        return true;
      }

      if (isInAlias) {
        return true;
      }
    }

    return isSameSymbol;
  });
}

export function getReceivedAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { result, id } = record;
  const fromToken = getTokenConfigFromHelixRecord(record, 'sendToken')!;
  const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');

  let decimals = toToken?.decimals;

  if (result === RecordStatus.refunded) {
    decimals = fromToken.decimals;
  }

  return fromWei(
    { value: record.recvAmount, decimals },
    (val) => (id.startsWith('xcm') ? removeHelixFlag(val, decimals) : val),
    (val) => prettyNumber(val, { ignoreZeroDecimal: true })
  );
}

export function getFeeAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, feeToken } = record;
  const fromConfig = getOriginChainConfig(fromChain);
  const token = fromConfig.tokens.find((item) => item.symbol === feeToken || item.symbolAlias?.includes(feeToken))!;
  let decimals = token?.decimals;

  if (!decimals) {
    decimals = isPolkadotNetwork(fromChain) && !fromChain.includes('parachain') ? 9 : 18;
  }

  return fromWei({ value: record.fee, decimals }, (val) => prettyNumber(val, { ignoreZeroDecimal: true }));
}

export function getSentAmountFromHelixRecord(record: HelixHistoryRecord) {
  const { fromChain, sendToken, sendAmount, id } = record;
  const fromToken = getOriginChainConfig(fromChain)!.tokens.find(
    (item) => item.symbol === sendToken || item.symbolAlias?.includes(sendToken)
  );

  return fromWei(
    { value: sendAmount, decimals: fromToken?.decimals },
    (val) => (id.startsWith('xcm') ? removeHelixFlag(val, fromToken?.decimals) : val),
    (val) => prettyNumber(val, { ignoreZeroDecimal: true })
  );
}

export function getDirectionFromHelixRecord(record: HelixHistoryRecord): CrossChainDirection | null {
  const { fromChain, toChain, sendAmount, recvAmount } = record;
  const fromConfig = getOriginChainConfig(fromChain);
  const toConfig = getOriginChainConfig(toChain);
  const fromToken = getTokenConfigFromHelixRecord(record, 'sendToken');
  const toToken = getTokenConfigFromHelixRecord(record, 'recvToken');

  if (fromToken && toToken) {
    return {
      from: { ...fromToken, meta: fromConfig, amount: fromWei({ ...fromToken, amount: sendAmount }) },
      to: { ...toToken, meta: toConfig, amount: fromWei({ ...toToken, amount: recvAmount }) },
    };
  }

  return null;
}

export function getCategoryFromRecord(record: HelixHistoryRecord): string | null {
  const prefix = record.bridge.toLowerCase().split('-')[0];
  switch (prefix) {
    case 'helix': {
      return 'helix';
    }
    case 'lpbridge': {
      return 'helixLpBridge';
    }
    case 'cbridge': {
      return 'cBridge';
    }
    case 'xcm': {
      return 'xcm';
    }
    default: {
      return null;
    }
  }
}

export function isHelixRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('helix');
}

export function isHelixLpRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('lpbridge');
}

export function isCBridgeRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('cbridge');
}

export function isXCMRecord(record: HelixHistoryRecord): boolean {
  return record.bridge.toLowerCase().startsWith('xcm');
}
