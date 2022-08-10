import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { EthereumAstarBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumAstarBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
