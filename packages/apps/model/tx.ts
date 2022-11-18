import { BridgeBase } from 'shared/core/bridge';
import { SupportedWallet } from 'shared/model';
import { CrossChainDirection, CrossToken } from 'shared/model/bridge/cross-chain';

interface CrossChainParty {
  recipient: string;
  sender: string;
}

export interface CrossChainPayload<
  B extends BridgeBase = BridgeBase,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken,
  W extends SupportedWallet = SupportedWallet
> extends CrossChainParty {
  bridge: B;
  direction: CrossChainDirection<F, T>;
  slippage?: number;
  wallet: W;
}
