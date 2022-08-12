import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabDVMOptimismBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMOptimismBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
