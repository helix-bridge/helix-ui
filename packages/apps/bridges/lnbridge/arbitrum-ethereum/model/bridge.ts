import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ArbitrumEthereumContractConfig = ContractConfig;

export type ArbitrumEthereumBridgeConfig = Required<BridgeConfig<ArbitrumEthereumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ArbitrumEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ArbitrumEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
