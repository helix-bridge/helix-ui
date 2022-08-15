import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { CrabDVMAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
