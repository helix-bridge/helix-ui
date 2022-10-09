import { BridgeConfig, ContractConfig, CrossChainPayload, CrossToken, ParachainChainConfig } from 'shared/model';
import { Bridge } from '../../../../model/bridge';

type CrabParachainMoonriverContractConfig = ContractConfig;

export type CrabParachainMoonriverBridgeConfig = Required<BridgeConfig<CrabParachainMoonriverContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>;
