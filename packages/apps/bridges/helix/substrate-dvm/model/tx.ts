import { BridgeBase, CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { SubstrateDVMBridgeConfig } from './bridge';

export type TransferPayload = CrossChainPayload<
  BridgeBase<SubstrateDVMBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type WithdrawPayload = CrossChainPayload<
  BridgeBase<SubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
