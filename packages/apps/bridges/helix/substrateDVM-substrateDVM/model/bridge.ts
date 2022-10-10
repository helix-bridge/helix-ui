import { ContractConfig, BridgeConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

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
