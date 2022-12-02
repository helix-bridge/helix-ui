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

type KhalaMoonriverContractConfig = ContractConfig;

export type KhalaMoonriverBridgeConfig = Required<BridgeConfig<KhalaMoonriverContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<KhalaMoonriverBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<KhalaMoonriverBridgeConfig, ParachainEthereumCompatibleChainConfig, ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  EthereumExtension
>;
