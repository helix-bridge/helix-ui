import { Bridge, CrossChainPayload, CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { CrabDVMHecoBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMHecoBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<DVMChainConfig>
> & { maxSlippage: number };

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMHecoBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };
