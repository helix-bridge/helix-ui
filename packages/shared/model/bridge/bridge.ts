import { isEqual, pick } from 'lodash';
import { FunctionComponent } from 'react';
import { BridgeCategory, BridgeName, ChainConfig } from '../network';

/* ----------------------------------------------- bridge state ------------------------------------------------ */

export type BridgeStatus = 'pending' | 'available' | 'error';

/* ----------------------------------------------- bridge vertices ------------------------------------------------ */

export type Vertices = Pick<ChainConfig, 'name' | 'mode'>;

export type Departure = Vertices;

export type Arrival = Vertices;

/* ----------------------------------------------- bridge config ------------------------------------------------ */

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
    }
  ) {
    const dep = this.toVertices(departure);
    const arr = this.toVertices(arrival);

    this.name = options.name;
    this.departure = departure;
    this.arrival = arrival;
    this.issuing = [dep, arr];
    this.redeem = [arr, dep];
    this._config = config;
    this.status = options?.status ?? 'available';
    this.activeArrivalConnection = options?.activeArrivalConnection ?? false;
    this.category = options.category;
    this.isTest = departure.isTest;
  }

  get config() {
    return this._config;
  }

  private toVertices(config: ChainConfig): Vertices {
    return { name: config.name, mode: config.mode };
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
      [dep, arr].map((item) => pick(item, ['name', 'mode']))
    );
  }

  isRedeem(dep: Departure | ChainConfig, arr: Departure | ChainConfig): boolean {
    return isEqual(
      this.redeem,
      [dep, arr].map((item) => pick(item, ['name', 'mode']))
    );
  }

  get IssuingCrossChainComponent() {
    return this.crossChain.get(this.issuing);
  }

  get RedeemCrossChainComponent() {
    return this.crossChain.get(this.redeem);
  }
}
