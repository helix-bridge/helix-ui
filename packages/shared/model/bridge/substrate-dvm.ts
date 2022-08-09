import { BridgeConfig } from './bridge';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig, 'contracts'>>;
