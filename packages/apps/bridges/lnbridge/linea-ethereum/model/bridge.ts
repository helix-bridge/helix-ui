import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type LineaEthereumContractConfig = ContractConfig;

export type LineaEthereumBridgeConfig = Required<BridgeConfig<LineaEthereumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<LineaEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<LineaEthereumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
