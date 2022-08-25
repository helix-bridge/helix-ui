import { BridgeConfig } from 'shared/model';

export type SubstrateSubstrateDVMBridgeConfig = Required<Omit<BridgeConfig, 'contracts'>>;
