import { BridgeConfig, ContractConfig, CrossToken, ParachainChainConfig, PolkadotExtension } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type KaruraShidenContractConfig = ContractConfig;

export type KaruraShidenBridgeConfig = Required<BridgeConfig<KaruraShidenContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<KaruraShidenBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<KaruraShidenBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;
