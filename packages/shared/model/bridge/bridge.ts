import { Network } from '../network';

/* ----------------------------------------------- bridge state ------------------------------------------------ */

export type BridgeStatus = 'pending' | 'available' | 'error';

/* ----------------------------------------------- bridge vertices ------------------------------------------------ */

export type Departure = Network;

export type Arrival = Network;

/* ----------------------------------------------- bridge config ------------------------------------------------ */

export type BridgeCategory = 'helix' | 'cBridge' | 'XCM';

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

export interface BridgeConfig<C = ContractConfig> {
  contracts?: C;
}
