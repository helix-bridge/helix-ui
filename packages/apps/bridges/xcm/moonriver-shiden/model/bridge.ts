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

type MoonriverShidenContractConfig = ContractConfig;

export type MoonriverShidenBridgeConfig = Required<BridgeConfig<MoonriverShidenContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<MoonriverShidenBridgeConfig, ParachainEthereumCompatibleChainConfig, ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  EthereumExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<MoonriverShidenBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  PolkadotExtension
>;
