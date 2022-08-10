import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { EthereumBnbBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumBnbBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumBnbBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
