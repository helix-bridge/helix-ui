import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { EthereumBSCBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumBSCBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumBSCBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
