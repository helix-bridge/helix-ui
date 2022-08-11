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

export type BridgeCategory = 'helix' | 'cBridge';

export interface LockEventsStorage {
  min: number;
  max: number | null;
  key: string;
}

export interface ContractConfig {
  issuing: string;
  redeem: string;
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

  readonly issuing: [Departure, Arrival];

  readonly redeem: [Arrival, Departure];

  readonly category: BridgeCategory;

  readonly isTest: boolean;

  readonly disableIssuing: boolean;

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
      disableIssuing?: boolean;
      disableRedeem?: boolean;
    }
  ) {
    const dep = departure.name;
    const arr = arrival.name;

    this.name = options.name;
    this.departure = departure;
    this.arrival = arrival;
    this.issuing = [dep, arr];
    this.redeem = [arr, dep];
    this._config = config;
    this.status = options.status ?? 'available';
    this.activeArrivalConnection = options.activeArrivalConnection ?? false;
    this.category = options.category;
    this.isTest = departure.isTest;
    this.disableIssuing = options.disableIssuing ?? false;
    this.disableRedeem = options.disableRedeem ?? false;
  }

  get config() {
    return this._config;
  }

  setIssuingComponents(crossComp: FunctionComponent): void {
    this.crossChain.set(this.issuing, crossComp);
  }

  setRedeemComponents(crossComp: FunctionComponent) {
    this.crossChain.set(this.redeem, crossComp);
  }

  isIssuing(dep: Departure | ChainConfig, arr: Departure | ChainConfig): boolean {
    return isEqual(
      this.issuing,
      [dep, arr].map((item) => (typeof item === 'object' ? item.name : item))
    );
  }

  isRedeem(dep: Departure | ChainConfig, arr: Departure | ChainConfig): boolean {
    return isEqual(
      this.redeem,
      [dep, arr].map((item) => (typeof item === 'object' ? item.name : item))
    );
  }

  get IssuingCrossChainComponent() {
    return this.crossChain.get(this.issuing);
  }

  get RedeemCrossChainComponent() {
    return this.crossChain.get(this.redeem);
  }
}
