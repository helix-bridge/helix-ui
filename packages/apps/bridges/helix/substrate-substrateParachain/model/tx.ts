import { CrossChainPayload, CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { SubstrateSubstrateParachainBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig, PolkadotChainConfig, ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateSubstrateParachainBridgeConfig, PolkadotChainConfig, ParachainChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
