import { BridgeConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type LineaArbitrumContractConfig = ContractConfig;

export type LineaArbitrumBridgeConfig = Required<BridgeConfig<LineaArbitrumContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<LineaArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<LineaArbitrumBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
