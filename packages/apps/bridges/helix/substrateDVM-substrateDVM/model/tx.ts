import { CrossChainPayload, CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../model/bridge';
import { SubstrateDVMSubstrateDVMBridgeConfig } from './bridge';

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
