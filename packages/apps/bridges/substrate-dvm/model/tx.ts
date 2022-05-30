import { Bridge, CrossChainPayload, CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { SubstrateDVMBridgeConfig } from './bridge';

export type TransferPayload = CrossChainPayload<
  Bridge<SubstrateDVMBridgeConfig>,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type WithdrawPayload = CrossChainPayload<
  Bridge<SubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>;
