import {
  BridgeConfig,
  ContractConfig,
  CrossToken,
  EthereumExtension,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  PolkadotExtension,
} from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type KaruraMoonriverContractConfig = ContractConfig;

export type KaruraMoonriverBridgeConfig = Required<BridgeConfig<KaruraMoonriverContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<KaruraMoonriverBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<KaruraMoonriverBridgeConfig, ParachainEthereumCompatibleChainConfig, ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  EthereumExtension
>;
