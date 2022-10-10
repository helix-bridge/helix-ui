import {
  BridgeConfig,
  ContractConfig,
  CrossChainPayload,
  CrossToken,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
} from 'shared/model';
import { Bridge } from '../../../../core/bridge';

type CrabParachainMoonriverContractConfig = ContractConfig;

export type CrabParachainMoonriverBridgeConfig = Required<BridgeConfig<CrabParachainMoonriverContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabParachainMoonriverBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>
>;
