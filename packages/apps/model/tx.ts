import type { Observable } from 'rxjs';
import { BridgeBase } from 'shared/core/bridge';
import { CrossChainDirection, CrossToken } from 'shared/model/bridge/cross-chain';
import { Tx } from 'shared/model/tx';

interface CrossChainParty {
  recipient: string;
  sender: string;
}

export interface CrossChainPayload<
  B extends BridgeBase = BridgeBase,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> extends CrossChainParty {
  bridge: B;
  direction: CrossChainDirection<F, T>;
  slippage?: number;
}

export type TxObservableFactory = (value: CrossChainPayload) => Observable<Tx>;
