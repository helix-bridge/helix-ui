import { ContractConfig, BridgeConfig, PolkadotExtension } from 'shared/model';
import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type SubstrateSubstrateParachainContractConfig = ContractConfig;

export type SubstrateSubstrateParachainBridgeConfig = Required<BridgeConfig<SubstrateSubstrateParachainContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig, PolkadotChainConfig, ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<ParachainChainConfig>,
  PolkadotExtension
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig, PolkadotChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>,
  PolkadotExtension
>;
