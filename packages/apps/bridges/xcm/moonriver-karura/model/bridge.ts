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

type MoonriverKaruraContractConfig = ContractConfig;

export type MoonriverKaruraBridgeConfig = Required<BridgeConfig<MoonriverKaruraContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<MoonriverKaruraBridgeConfig, ParachainEthereumCompatibleChainConfig, ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  EthereumExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<MoonriverKaruraBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  PolkadotExtension
>;
