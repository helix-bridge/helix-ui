import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabDVMArbitrumBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMArbitrumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMArbitrumBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
