import { Network } from '../network';

/* ----------------------------------------------- bridge state ------------------------------------------------ */

export type BridgeStatus = 'pending' | 'available' | 'error';

/* ----------------------------------------------- bridge vertices ------------------------------------------------ */

export type Departure = Network;

export type Arrival = Network;

/* ----------------------------------------------- bridge config ------------------------------------------------ */

export type BridgeCategory = 'helix' | 'helixLpBridge' | 'cBridge' | 'XCM' | 'l1tol2' | 'LnBridge';

export interface LockEventsStorage {
  min: number;
  max: number | null;
  key: string;
}

export interface ContractConfig {
  backing: string;
  issuing: string;
}

export interface CBridgeContractConfig extends ContractConfig {
  stablecoinIssuing?: string;
  stablecoinBacking?: string;
  busdIssuing?: string;
}

export interface L2BridgeContractConfig extends ContractConfig {
  gatewayAddress: string;
  helixDaoAddress: string;
}

export interface BridgeConfig<C = ContractConfig> {
  contracts?: C;
}
