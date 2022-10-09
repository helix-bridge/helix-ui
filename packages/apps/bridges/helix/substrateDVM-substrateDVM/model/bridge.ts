import { ContractConfig, BridgeConfig } from 'shared/model';
import { CrossChainPayload, CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../model/bridge';

type SubstrateDVMSubstrateDVMContractConfig = ContractConfig;

export type SubstrateDVMSubstrateDVMBridgeConfig = Required<BridgeConfig<SubstrateDVMSubstrateDVMContractConfig>>;

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
