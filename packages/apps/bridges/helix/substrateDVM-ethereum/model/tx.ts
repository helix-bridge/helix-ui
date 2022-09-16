import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { SubstrateDVMEthereumBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMEthereumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMEthereumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
