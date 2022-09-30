import isEqual from 'lodash/isEqual';
import upperFirst from 'lodash/upperFirst';
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

interface BridgeOptions {
  name: BridgeName;
  category: BridgeCategory;
  status?: BridgeStatus;
  activeArrivalConnection?: boolean;
  disableIssue?: boolean;
  disableRedeem?: boolean;
  issueCompName?: string;
  redeemCompName?: string;
}

/* ----------------------------------------------- bridge  ------------------------------------------------ */

/**
 * departure -> arrival: issuing;
 * departure <- arrival: redeem;
 */
export class BridgeBase<C = BridgeConfig> {
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

  private options: BridgeOptions;

  private crossChain: Map<Departure[], string> = new Map();

  constructor(departure: ChainConfig, arrival: ChainConfig, config: C, options: BridgeOptions) {
    const dep = departure.name;
    const arr = arrival.name;

    this.options = options;
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

  private toComponentName(name: string) {
    return name === 'bsc' ? name.toUpperCase() : upperFirst(name);
  }

  setIssueComponents(crossComp: string): void {
    this.crossChain.set(this.issue, crossComp);
  }

  setRedeemComponents(crossComp: string) {
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

  get IssueCrossChainComponent(): string {
    return (
      this.options.issueCompName ||
      this.name.split('-').map(this.toComponentName).join('2') ||
      this.issue.map((item) => item.split('-').map(this.toComponentName).join('')).join('2')
    );
  }

  get RedeemCrossChainComponent(): string {
    return (
      this.options.redeemCompName ||
      this.name.split('-').map(this.toComponentName).reverse().join('2') ||
      this.issue
        .map((item) => item.split('-').map(this.toComponentName).join(''))
        .reverse()
        .join('2')
    );
  }
}
