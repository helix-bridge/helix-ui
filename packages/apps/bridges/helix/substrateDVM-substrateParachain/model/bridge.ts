import { BridgeConfig, DVMChainConfig, ParachainChainConfig } from 'shared/model';
import { ContractConfig } from 'shared/model';
import { CrossToken } from 'shared/model';
import { Bridge } from '../../../../core/bridge';
import { CrossChainPayload } from '../../../../model/tx';

type SubstrateDVMSubstrateParachainContractConfig = ContractConfig;

export type SubstrateDVMSubstrateParachainBridgeConfig = Required<
  BridgeConfig<SubstrateDVMSubstrateParachainContractConfig>
>;

export type IssuingPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateParachainBridgeConfig, DVMChainConfig, ParachainChainConfig>,
  CrossToken<DVMChainConfig>,
  CrossToken<ParachainChainConfig>
>;

export type RedeemPayload = CrossChainPayload<
  Bridge<SubstrateDVMSubstrateParachainBridgeConfig, ParachainChainConfig, DVMChainConfig>,
  CrossToken<ParachainChainConfig>,
  CrossToken<DVMChainConfig>
>;
