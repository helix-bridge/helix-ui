import { decodeAddress } from '@polkadot/util-crypto';
import camelCaseKeys from 'camelcase-keys';
import { catchError, filter, map, Observable, of } from 'rxjs';
import { RecordStatus } from 'shared/config/constant';
import { isFormalChain } from 'shared/config/env';
import { ChainConfig, HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { apiUrl, isKton, isRing, rxGet } from 'shared/utils/helper';
import { buf2hex } from 'shared/utils/tx';
import {
  Darwinia2EthereumHistoryRes,
  Darwinia2EthereumRecord,
  Ethereum2DarwiniaRedeemHistoryRes,
  Ethereum2DarwiniaRedeemRecord,
} from '../bridges/ethereum-darwinia/model';
import { RecordRequestParams } from '../model';

const E2D_ENDPOINT = isFormalChain ? 'https://helix-api.darwinia.network' : 'https://api.darwinia.network.l2me.com';

export const fetchDarwinia2EthereumRecords = (
  { address, confirmed, paginator }: RecordRequestParams,
  departure: ChainConfig
) => {
  return rxGet<Darwinia2EthereumHistoryRes>({
    url: apiUrl(E2D_ENDPOINT, 'ethereumBacking/locks'),
    params: { address: buf2hex(decodeAddress(address).buffer), confirmed, ...paginator },
  }).pipe(
    map((res) =>
      res
        ? {
            ...res,
            // eslint-disable-next-line complexity
            list: res.list.map((data) => {
              const record = camelCaseKeys(data);
              const { blockTimestamp, signatures, ringValue, ktonValue, extrinsicIndex, tx, accountId } = record;
              const ring = departure.tokens.find((item) => isRing(item.symbol))!;
              const token = +ringValue > 0 ? ring : departure.tokens.find((item) => isKton(item.symbol))!;
              const arrival = ring.cross.find((item) => item.bridge === 'ethereum-darwinia')!;
              const amount = +ringValue > 0 ? ringValue : ktonValue;
              let result = RecordStatus.pending;

              if (signatures && !tx) {
                result = RecordStatus.pendingToClaim;
              } else if (tx) {
                result = RecordStatus.success;
              }

              return {
                sendAmount: amount,
                recvAmount: amount,
                bridge: 'helix',
                endTime: blockTimestamp,
                fee: '',
                feeToken: ring.symbol,
                fromChain: departure.name,
                id: extrinsicIndex,
                nonce: '',
                recipient: '',
                requestTxHash: extrinsicIndex,
                responseTxHash: tx,
                reason: '',
                result,
                sender: accountId,
                startTime: blockTimestamp,
                toChain: arrival.partner.name,
                sendToken: token.symbol,
                recvToken: arrival.partner.symbol,
                messageNonce: '',
                ...record,
              };
            }),
          }
        : { count: 0, list: [] }
    ),
    catchError((err) => {
      console.error('%c [ d2e records request error: ]', 'font-size:13px; background:pink; color:#bf2c9f;', err);
      return of(null);
    }),
    filter((res) => !!res)
  ) as NonNullable<
    Observable<Darwinia2EthereumHistoryRes<HelixHistoryRecord & ICamelCaseKeys<Darwinia2EthereumRecord>>>
  >;
};

export const fetchEthereum2DarwiniaRecords = (
  { address, confirmed, paginator }: RecordRequestParams,
  departure: ChainConfig
) => {
  return rxGet<Ethereum2DarwiniaRedeemHistoryRes>({
    url: apiUrl(E2D_ENDPOINT, 'redeem'),
    params: { address, confirmed, ...paginator },
  }).pipe(
    map((res) =>
      res
        ? {
            ...res,
            list: res.list.map((item) => {
              const record = camelCaseKeys(item);
              const { blockTimestamp, tx, darwiniaTx, currency, amount } = record;
              const ring = departure.tokens.find((tk) => isRing(tk.symbol))!;
              const isRingTransfer = isRing(currency);
              const token = departure.tokens.find((tk) => (isRingTransfer ? isRing(tk.symbol) : isKton(tk.symbol)))!;
              const arrival = ring.cross.find((overview) => overview.bridge === 'ethereum-darwinia')!;

              return {
                bridge: 'helix',
                endTime: blockTimestamp,
                fee: '',
                feeToken: ring.symbol,
                fromChain: departure.name,
                id: 'e2d-' + blockTimestamp,
                nonce: '',
                recipient: '',
                requestTxHash: tx,
                responseTxHash: darwiniaTx,
                reason: '',
                result: tx && darwiniaTx ? RecordStatus.success : RecordStatus.pending,
                sender: '',
                startTime: blockTimestamp,
                toChain: arrival.partner.name,
                sendToken: token.symbol,
                recvToken: arrival.partner.symbol,
                sendAmount: amount,
                recvAmount: amount,
                ...record,
              };
            }),
          }
        : { count: 0, list: [] }
    ),
    catchError((err) => {
      console.error(
        '%c [ e2d cross chain api request error: ]',
        'font-size:13px; background:pink; color:#bf2c9f;',
        err
      );
      return of(null);
    }),
    filter((res) => !!res)
  ) as NonNullable<
    Observable<Ethereum2DarwiniaRedeemHistoryRes<HelixHistoryRecord & ICamelCaseKeys<Ethereum2DarwiniaRedeemRecord>>>
  >;
};
