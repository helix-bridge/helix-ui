import { BridgeConfig, ContractConfig, CrossToken, ParachainChainConfig, PolkadotExtension } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type KhalaShidenContractConfig = ContractConfig;

export type KhalaShidenBridgeConfig = Required<BridgeConfig<KhalaShidenContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<KhalaShidenBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<KhalaShidenBridgeConfig, ParachainChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;
