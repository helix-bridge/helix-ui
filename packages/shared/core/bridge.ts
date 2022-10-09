import isEqual from 'lodash/isEqual';
import upperFirst from 'lodash/upperFirst';
import { Arrival, BridgeCategory, BridgeConfig, BridgeStatus, Departure } from '../model/bridge/bridge';
import { BridgeName } from '../model/bridge/supports';
import { ChainConfig } from '../model/network/config';

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

/**
 * departure -> arrival: issuing;
 * departure <- arrival: redeem;
 */
export class BridgeBase<C = BridgeConfig, O extends ChainConfig = ChainConfig, T extends ChainConfig = ChainConfig> {
  readonly name: BridgeName;

  readonly status: BridgeStatus;

  readonly activeArrivalConnection: boolean;

  readonly departure: O;

  readonly arrival: T;

  readonly issue: [Departure, Arrival];

  readonly redeem: [Arrival, Departure];

  readonly category: BridgeCategory;

  readonly isTest: boolean;

  readonly disableIssue: boolean;

  readonly disableRedeem: boolean;

  private _config: C;

  private options: BridgeOptions;

  private crossChain: Map<Departure[], string> = new Map();

  constructor(departure: O, arrival: T, config: C, options: BridgeOptions) {
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
