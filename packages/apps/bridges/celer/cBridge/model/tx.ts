import { Bridge, CrossChainPayload, CrossToken, EthereumChainConfig } from 'shared/model';
import { CBridgeBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };

export type RedeemPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };
