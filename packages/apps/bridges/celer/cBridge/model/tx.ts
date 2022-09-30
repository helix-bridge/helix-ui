import { BridgeBase, CrossChainPayload, CrossToken, EthereumChainConfig } from 'shared/model';
import { CBridgeBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  BridgeBase<CBridgeBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };

export type RedeemPayload = CrossChainPayload<
  BridgeBase<CBridgeBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };
