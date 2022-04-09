import { has, isEqual } from 'lodash';
import { FunctionComponent } from 'react';
import { ChainConfig } from '../network';
import { Network, NetworkMode } from '../network/network';

/* ----------------------------------------------- bridge state ------------------------------------------------ */

export type BridgeStatus = 'pending' | 'available';

/* ----------------------------------------------- bridge vertices ------------------------------------------------ */

export interface Vertices {
  network: Network;
  mode: NetworkMode;
}

export type Departure = Vertices;

export type Arrival = Vertices;

export type BridgeDirection = [Departure, Arrival];

/* ----------------------------------------------- bridge config ------------------------------------------------ */

/**
 * TODO: remove centralized API:
 * dapp: e2d records; erc20 register proof querying
 * evolution: deposit records
 * subscan: airdrop records in crab
 */
export type ApiKeys = 'subql' | 'subqlMMr' | 'evolution' | 'dapp' | 'subscan' | 'subGraph';

export type Api<T extends ApiKeys> = { [key in T]: string };

export interface LockEventsStorage {
  min: number;
  max: number | null;
  key: string;
}

export interface ContractConfig {
  issuing: string;
  redeem: string;
}

export interface BridgeConfig<C = ContractConfig, K = Record<string, string>> {
  contracts?: C;
  api?: K;
}

/* ----------------------------------------------- bridge  ------------------------------------------------ */

type BridgeCategory = 'helix';

/**
 * departure -> arrival: issuing;
 * departure <- arrival: redeem;
 */
export class Bridge<C = BridgeConfig> {
  readonly status: BridgeStatus;

  readonly stable: boolean;

  readonly activeAssistantConnection: boolean;

  readonly departure: ChainConfig;

  readonly arrival: ChainConfig;

  readonly issuing: [Departure, Arrival];

  readonly redeem: [Arrival, Departure];

  readonly category: BridgeCategory;

  private _config: C;

  private crossChain: Map<Departure[], FunctionComponent> = new Map();

  private record: Map<Departure[], FunctionComponent> = new Map();

  constructor(
    departure: ChainConfig,
    arrival: ChainConfig,
    config: C,
    options: {
      category: BridgeCategory;
      status?: BridgeStatus;
      stable?: boolean;
      activeAssistantConnection?: boolean;
    }
  ) {
    const dep = this.toVertices(departure);
    const arr = this.toVertices(arrival);

    this.departure = departure;
    this.arrival = arrival;
    this.issuing = [dep, arr];
    this.redeem = [arr, dep];
    this._config = config;
    this.status = options?.status ?? 'available';
    this.stable = options?.stable ?? true;
    this.activeAssistantConnection = options?.activeAssistantConnection ?? false;
    this.category = options.category;
  }

  get config() {
    return this._config;
  }

  private toVertices(config: ChainConfig): Vertices {
    return { network: config.name, mode: has(config, 'dvm') ? 'dvm' : 'native' };
  }

  setIssuingComponents(crossComp: FunctionComponent, recordComp: FunctionComponent): void {
    this.crossChain.set(this.issuing, crossComp);
    this.record.set(this.issuing, recordComp);
  }

  setRedeemComponents(crossComp: FunctionComponent, recordComp: FunctionComponent) {
    this.crossChain.set(this.redeem, crossComp);
    this.record.set(this.redeem, recordComp);
  }

  isIssuing(departure: Departure, arrival: Departure): boolean {
    return isEqual(this.issuing, [departure, arrival]);
  }

  isRedeem(departure: Departure, arrival: Departure): boolean {
    return isEqual(this.redeem, [departure, arrival]);
  }

  get IssuingCrossChainComponent() {
    return this.crossChain.get(this.issuing);
  }

  get RedeemCrossChainComponent() {
    return this.crossChain.get(this.redeem);
  }

  get IssuingRecordComponent() {
    return this.record.get(this.issuing);
  }

  get RedeemRecordComponent() {
    return this.record.get(this.redeem);
  }
}
