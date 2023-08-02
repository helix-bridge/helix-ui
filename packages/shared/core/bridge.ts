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
  isDefault?: boolean;
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

  readonly options: BridgeOptions;

  readonly isDefault: boolean;

  // eslint-disable-next-line complexity
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
    this.isDefault = options.isDefault ?? false;
  }

  get config() {
    return this._config;
  }

  private toComponentName(name: string) {
    return name === 'bsc' ? name.toUpperCase() : upperFirst(name);
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

  /**
   * naming convention: OriginChain2TargetChain
   * The naming of components and bridge subclasses must conform to this rule
   * TODO: better unique naming
   * e.g. darwinia-dvm <> crab-dvm and crab-dvm <> darwinia-dvm should be recognized as different bridges
   * But for ui components, the naming will be conflict, both are DarwiniaDVM2CrabDVM and CrabDVM2DarwiniaDVM, although the meanings are different.
   * DarwiniaDVM2CrabDVM is issue component for darwinia-dvm <> crab-dvm and is redeem component for crab-dvm <> darwinia-dvm.
   */
  get subClsName(): string {
    if (this.category === 'cBridge') {
      return 'CBridgeBridge';
    }

    // if (this.category === 'helixLpBridge') {
    // return 'HelixLpBridgeBridge';
    // }

    if (this.category === 'l1tol2') {
      return this.IssueComponentName.split('2').join('') + 'BridgeL2';
    }

    if (this.category === 'lnbridgev20-opposite' || this.category === 'lnbridgev20-default') {
      return this.IssueComponentName.split('2').join('') + 'LnBridge';
    }

    return this.IssueComponentName.split('2').join('') + 'Bridge';
  }

  get IssueComponentName(): string {
    return this.options.issueCompName || this.name.split('-').map(this.toComponentName).join('2');
  }

  get IssueComponentAlias(): string {
    return this.issue.map((item) => item.split('-').map(this.toComponentName).join('')).join('2');
  }

  get RedeemComponentName(): string {
    return this.options.redeemCompName || this.name.split('-').map(this.toComponentName).reverse().join('2');
  }

  get RedeemComponentAlias(): string {
    return this.issue
      .map((item) => item.split('-').map(this.toComponentName).join(''))
      .reverse()
      .join('2');
  }
}
