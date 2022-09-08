import { isEqual } from 'lodash';
import { FunctionComponent } from 'react';
import { ChainConfig, Network } from '../network';
import { BridgeName } from './supports';

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

/* ----------------------------------------------- bridge  ------------------------------------------------ */

/**
 * departure -> arrival: issuing;
 * departure <- arrival: redeem;
 */
export class Bridge<C = BridgeConfig> {
  readonly name: BridgeName;

  readonly status: BridgeStatus;

  readonly activeArrivalConnection: boolean;

  readonly departure: ChainConfig;

  readonly arrival: ChainConfig;

  readonly issue: [Departure, Arrival];

  readonly redeem: [Arrival, Departure];

  readonly category: BridgeCategory;

  readonly isTest: boolean;

  readonly disableIssue: boolean;

  readonly disableRedeem: boolean;

  private _config: C;

  private crossChain: Map<Departure[], FunctionComponent> = new Map();

  constructor(
    departure: ChainConfig,
    arrival: ChainConfig,
    config: C,
    options: {
      name: BridgeName;
      category: BridgeCategory;
      status?: BridgeStatus;
      activeArrivalConnection?: boolean;
      disableIssue?: boolean;
      disableRedeem?: boolean;
    }
  ) {
    const dep = departure.name;
    const arr = arrival.name;

    this.name = options.name;
    this.departure = departure;
    this.arrival = arrival;
    this.issue = [dep, arr];
    this.redeem = [arr, dep];
    this._config = config;
    this.status = options.status ?? 'available';
    this.activeArrivalConnection = options.activeArrivalConnection ?? false;
    this.category = options.category;
    this.isTest = departure.isTest;
    this.disableIssue = options.disableIssue ?? false;
    this.disableRedeem = options.disableRedeem ?? false;
  }

  get config() {
    return this._config;
  }

  setIssueComponents(crossComp: FunctionComponent): void {
    this.crossChain.set(this.issue, crossComp);
  }

  setRedeemComponents(crossComp: FunctionComponent) {
    this.crossChain.set(this.redeem, crossComp);
  }

  isIssue(dep: Departure | ChainConfig, arr: Departure | ChainConfig): boolean {
    return isEqual(
      this.issue,
      [dep, arr].map((item) => (typeof item === 'object' ? item.name : item))
    );
  }

  isRedeem(dep: Departure | ChainConfig, arr: Departure | ChainConfig): boolean {
    return isEqual(
      this.redeem,
      [dep, arr].map((item) => (typeof item === 'object' ? item.name : item))
    );
  }

  get IssueCrossChainComponent() {
    return this.crossChain.get(this.issue);
  }

  get RedeemCrossChainComponent() {
    return this.crossChain.get(this.redeem);
  }
}
