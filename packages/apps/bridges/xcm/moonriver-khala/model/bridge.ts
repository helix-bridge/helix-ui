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

type MoonriverKhalaContractConfig = ContractConfig;

export type MoonriverKhalaBridgeConfig = Required<BridgeConfig<MoonriverKhalaContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<MoonriverKhalaBridgeConfig, ParachainEthereumCompatibleChainConfig, ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  EthereumExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<MoonriverKhalaBridgeConfig, ParachainChainConfig, ParachainEthereumCompatibleChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainEthereumCompatibleChainConfig>,
  PolkadotExtension
>;
