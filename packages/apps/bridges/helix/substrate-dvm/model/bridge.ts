import { BridgeConfig } from 'shared/model';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig, 'contracts'>>;
