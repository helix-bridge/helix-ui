import { isEqual, pick } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { unknownUnavailable } from '../../config/bridges/unknown-unavailable';
import {
  Api,
  ApiKeys,
  Bridge,
  BridgeConfig,
  ChainConfig,
  ContractConfig,
  CrossChainDirection,
  NullableFields,
  Vertices,
} from '../../model';
import { getChainConfig, isEthereumNetwork, isPolkadotNetwork } from '../network/network';

type BridgePredicateFn = (departure: Vertices, arrival: Vertices) => boolean;

export type DVMBridgeConfig = Required<
  BridgeConfig<ContractConfig & { proof: string }, Pick<Api<ApiKeys>, 'dapp' | 'evolution'>>
>;

export const isSubstrate2SubstrateDVM: BridgePredicateFn = (departure, arrival) => {
  return (
    isPolkadotNetwork(departure) &&
    isPolkadotNetwork(arrival) &&
    arrival.mode === 'dvm' &&
    arrival.name !== departure.name
  );
};

export const isSubstrateDVM2Substrate: BridgePredicateFn = (departure, arrival) =>
  isSubstrate2SubstrateDVM(arrival, departure);

export const isEthereum2Darwinia: BridgePredicateFn = (departure, arrival) => {
  return isEthereumNetwork(departure) && isPolkadotNetwork(arrival) && arrival.mode === 'native';
};

export const isDarwinia2Ethereum: BridgePredicateFn = (departure, arrival) => isEthereum2Darwinia(arrival, departure);

export const isSubstrate2DVM: BridgePredicateFn = (departure, arrival) => {
  return (
    isPolkadotNetwork(departure) &&
    isPolkadotNetwork(arrival) &&
    arrival.mode === 'dvm' &&
    departure.name === arrival.name
  );
};

export const isDVM2Substrate: BridgePredicateFn = (departure, arrival) => isSubstrate2DVM(arrival, departure);

export const isSubstrateDVM: BridgePredicateFn = (departure, arrival) =>
  isSubstrate2DVM(departure, arrival) || isDVM2Substrate(departure, arrival);

/**
 * Shorthand functions for predication without direction
 */
export const isS2S: BridgePredicateFn = (departure, arrival) => {
  return [isSubstrate2SubstrateDVM, isSubstrateDVM2Substrate].some((fn) => fn(departure, arrival));
};

export function hasBridge(source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig]): boolean {
  try {
    getBridge(source);

    return true;
  } catch (_) {
    return false;
  }
}

function getBridgeOverviews(source: NullableFields<CrossChainDirection, 'from' | 'to'>) {
  const { from, to } = source;

  if (!from || !to) {
    return [];
  }

  const { cross: bridges } = from;

  return bridges.filter((bridge) => {
    const { partner } = bridge;

    return (
      partner.symbol.toLowerCase() === to.symbol.toLowerCase() &&
      isEqual(pick(partner, ['mode', 'name']), pick(to.meta, ['mode', 'name']))
    );
  });
}

export function isTransferable(source: NullableFields<CrossChainDirection, 'from' | 'to'>): boolean {
  return !!getBridgeOverviews(source).length;
}

export function isBridgeAvailable(from: ChainConfig, to: ChainConfig): boolean {
  const bridge = getBridge([from, to]);

  return !!bridge && bridge.status === 'available';
}

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig]
): Bridge<T> {
  const direction = Array.isArray(source)
    ? source.map((item) => pick(item as Vertices, ['name', 'mode']) as Vertices)
    : [source.from, source.to].map((item) =>
        pick(item.meta ?? getChainConfig(item.symbol, item.type), ['name', 'mode'])
      );

  const bridge = BRIDGES.find((item) => isEqual(item.issuing, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    console.log(
      '🚨 ~ file: bridge.ts ~ line 95 ~ Error',
      `Bridge from ${direction[0]?.name}(${direction[0].mode}) to ${direction[1]?.name}(${direction[1].mode}) is not exist`
    );

    return unknownUnavailable as Bridge<T>;
  }

  return bridge as Bridge<T>;
}

export function getBridges(source: CrossChainDirection): Bridge[] {
  const overviews = getBridgeOverviews(source);

  return BRIDGES.filter(
    (bridge) =>
      bridge.isTest === source.from.meta.isTest &&
      overviews.find((overview) => overview.category === bridge.category && overview.bridge === bridge.name)
  );
}

export function getAvailableDVMBridge(departure: ChainConfig): Bridge<DVMBridgeConfig> {
  // FIXME: by default we use the first vertices here.
  const [bridge] = BRIDGES.filter(
    (item) => item.status === 'available' && isEqual(item.departure, departure) && item.arrival.mode === 'dvm'
  );

  if (bridge) {
    throw new Error(
      `Can not find available bridge(Ethereum type <-> DVM type) by departure network: ${departure.name}`
    );
  }

  return bridge as Bridge<DVMBridgeConfig>;
}

export function hasAvailableDVMBridge(departure: ChainConfig): boolean {
  try {
    getAvailableDVMBridge(departure);
    return true;
  } catch (_) {
    return false;
  }
}
