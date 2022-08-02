import { Bridge, CrossChainPayload, CrossToken, DVMChainConfig } from 'shared/model';
import { SubstrateDVMSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
