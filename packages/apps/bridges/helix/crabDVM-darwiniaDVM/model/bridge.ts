import { BridgeConfig, ContractConfig, CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type CrabDVMDarwiniaDVMContractConfig = ContractConfig;

export type CrabDVMDarwiniaDVMBridgeConfig = Required<BridgeConfig<CrabDVMDarwiniaDVMContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<CrabDVMDarwiniaDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<CrabDVMDarwiniaDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
