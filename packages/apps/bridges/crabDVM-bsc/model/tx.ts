import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabDVMBscBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMBscBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMBscBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
