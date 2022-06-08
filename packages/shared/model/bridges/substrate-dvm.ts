import { BridgeConfig } from '../bridge/bridge';

export type SubstrateDVMBridgeConfig = Required<Omit<BridgeConfig, 'contracts'>>;
