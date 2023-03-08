import { BridgeConfig, L2BridgeContractConfig, CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type EthereumArbitrumContractConfig = L2BridgeContractConfig;

export type EthereumArbitrumBridgeConfig = Required<BridgeConfig<EthereumArbitrumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
