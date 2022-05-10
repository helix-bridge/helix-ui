import { CrossChainPayload, Bridge, CrossToken, EthereumChainConfig, PolkadotChainConfig } from 'shared/model';
import { EthereumDarwiniaBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<EthereumDarwiniaBridgeConfig>,
  CrossToken<EthereumChainConfig>,
  CrossToken<PolkadotChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<EthereumDarwiniaBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<EthereumChainConfig>
>;
