import { ContractConfig, BridgeConfig } from 'shared/model';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type DarwiniaDVMCrabDVMContractConfig = ContractConfig;

export type DarwiniaDVMCrabDVMBridgeConfig = Required<BridgeConfig<DarwiniaDVMCrabDVMContractConfig>>;

export type IssuingPayload = CrossChainPayload<
  Bridge<DarwiniaDVMCrabDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<DarwiniaDVMCrabDVMBridgeConfig, DVMChainConfig, DVMChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>;
