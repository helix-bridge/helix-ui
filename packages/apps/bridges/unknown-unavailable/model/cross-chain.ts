import { CommonPayloadKeys, DeepRequired } from '../../../model';
import { CrossChainAsset, CrossChainParty, CrossChainPayload } from '../../../model/bridge';

export type IssuingUnknownTxPayload = CrossChainPayload<
  DeepRequired<Unknown2UnavailablePayload, ['sender' | 'assets' | 'recipient']>
>;

export type RedeemUnknownTxPayload = CrossChainPayload<DeepRequired<Unavailable2UnknownPayload, [CommonPayloadKeys]>>;

export interface Unknown2UnavailablePayload extends CrossChainParty, CrossChainAsset {}

export interface Unavailable2UnknownPayload extends CrossChainParty, CrossChainAsset {}
