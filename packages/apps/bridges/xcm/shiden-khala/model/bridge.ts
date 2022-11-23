import { BridgeConfig, ContractConfig, CrossToken, ParachainChainConfig, PolkadotExtension } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ShidenKhalaContractConfig = ContractConfig;

export type ShidenKhalaBridgeConfig = Required<BridgeConfig<ShidenKhalaContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ShidenKhalaBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ShidenKhalaBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;
