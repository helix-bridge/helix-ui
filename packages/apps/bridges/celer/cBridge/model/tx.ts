import { Bridge, CrossChainPayload, CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { CBridgeBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<DVMChainConfig>
> & { maxSlippage: number };

export type RedeemPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };
