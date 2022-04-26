import {
  CrossChainParty,
  CrossChainAsset,
  DarwiniaAsset,
  CommonPayloadKeys,
  CrossChainPayload,
  DeepRequired,
  DVMChainConfig,
  PolkadotChainConfig,
} from '@helix/shared/model';

export interface Substrate2DVMPayload extends CrossChainParty, CrossChainAsset<DarwiniaAsset> {}

export type SmartTxPayload<F extends PolkadotChainConfig = PolkadotChainConfig> = CrossChainPayload<
  DeepRequired<Substrate2DVMPayload, [CommonPayloadKeys]>,
  F,
  F extends DVMChainConfig ? PolkadotChainConfig : DVMChainConfig
>;
