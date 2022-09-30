import { BridgeBase, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<SubstrateDVMEthereumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  BridgeBase<SubstrateDVMEthereumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
