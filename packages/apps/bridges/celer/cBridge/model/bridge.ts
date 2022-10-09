import { BridgeConfig, ContractConfig, CrossChainPayload, CrossToken, EthereumChainConfig } from 'shared/model';
import { Bridge } from '../../../../model/bridge';

export interface CBridgeContractConfig extends ContractConfig {
  stablecoinBacking?: string;
  stablecoinIssuing?: string;
  busdIssuing?: string;
}

export type CBridgeBridgeConfig = Required<BridgeConfig<CBridgeContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig, EthereumChainConfig, EthereumChainConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };

export type RedeemPayload = CrossChainPayload<
  Bridge<CBridgeBridgeConfig, EthereumChainConfig, EthereumChainConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
> & { maxSlippage: number };
