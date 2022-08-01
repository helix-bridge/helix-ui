import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
import { SubstrateDVMSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig>,
  CrossToken<ChainConfig>,
  CrossToken<ChainConfig>
>;
