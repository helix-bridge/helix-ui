import {
  CrossChainPayload,
  DeepRequired,
  CommonPayloadKeys,
  CrossChainParty,
  CrossChainAsset,
  DarwiniaAsset,
} from '@helix/shared/model';
import { Deposit } from './deposit';

export type IssuingDarwiniaTxPayload = CrossChainPayload<
  DeepRequired<Darwinia2EthereumPayload, ['sender' | 'assets' | 'recipient']>
>;

export type RedeemDarwiniaTxPayload = CrossChainPayload<DeepRequired<Ethereum2DarwiniaPayload, [CommonPayloadKeys]>>;

export type RedeemDepositTxPayload = CrossChainPayload<
  DeepRequired<Ethereum2DarwiniaPayload, ['sender' | 'deposit' | 'recipient']>
>;

export interface Ethereum2DarwiniaPayload extends CrossChainParty, CrossChainAsset {
  deposit?: Deposit;
}

export interface Darwinia2EthereumPayload extends CrossChainParty {
  assets: (CrossChainAsset<DarwiniaAsset> & { checked?: boolean; decimals?: number })[];
}
