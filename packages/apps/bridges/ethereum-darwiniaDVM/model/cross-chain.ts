import {
  CrossChainParty,
  CrossChainAsset,
  MappingToken,
  CrossChainPayload,
  DeepRequired,
  CommonPayloadKeys,
} from 'shared/model';

export interface Erc20Payload extends CrossChainParty, CrossChainAsset<MappingToken> {}

export type Erc20TxPayload = CrossChainPayload<DeepRequired<Erc20Payload, [CommonPayloadKeys]>>;
