import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { EthereumAvalancheBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumAvalancheBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
