import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabDVMHecoBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMHecoBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMHecoBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
