import { BridgeConfig, ContractConfig, CrossToken, ParachainChainConfig, PolkadotExtension } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type ShidenMoonriverContractConfig = ContractConfig;

export type ShidenMoonriverBridgeConfig = Required<BridgeConfig<ShidenMoonriverContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<ShidenMoonriverBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<ShidenMoonriverBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;
