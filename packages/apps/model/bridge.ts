import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import {
  Bridge,
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossChainPayload,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';

export abstract class BridgePro<B extends BridgeConfig, O extends ChainConfig, T extends ChainConfig> extends Bridge {
  abstract issueHandle(payload: CrossChainPayload<Bridge<B>, CrossToken<O>, CrossToken<T>>, fee: BN): Observable<Tx>;

  abstract redeemHandle(payload: CrossChainPayload<Bridge<B>, CrossToken<T>, CrossToken<O>>, fee: BN): Observable<Tx>;

  abstract claim(record: HelixHistoryRecord): Observable<Tx>;

  abstract refund(record: HelixHistoryRecord): Observable<Tx>;

  abstract getFee(direction: CrossChainDirection<CrossToken<O | T>, CrossToken<O | T>>): Promise<BN | null>;

  abstract getDailyLimit(
    direction: CrossChainDirection<CrossToken<O | T>, CrossToken<O | T>>
  ): Promise<DailyLimit | null>;

  abstract getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]>;
}
