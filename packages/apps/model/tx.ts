import type { BigNumber } from 'ethers';
import { BridgeBase } from 'shared/core/bridge';
import { SupportedWallet } from 'shared/model';
import { CrossChainDirection, CrossToken } from 'shared/model/bridge/cross-chain';

// lnbridge snapshot parameter
interface Snapshot {
  remoteChainId: BigNumber;
  relayer: string;
  sourceToken: string;
  targetToken: string;
  transferId: string;
  depositedMargin: BigNumber;
  totalFee: BigNumber;
  withdrawNonce: BigNumber;
}

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
  snapshot?: Snapshot;
}
