import { has, isEqual, pick } from 'lodash';
import { ComingSoon } from '../../components/widget/ComingSoon';
import { BRIDGES } from '../../config/bridge';
import {
  Api,
  ApiKeys,
  Bridge,
  BridgeConfig,
  ChainConfig,
  ContractConfig,
  CrossChainDirection,
  Departure,
  Vertices,
} from '../../model';
import { isEthereumNetwork, isPolkadotNetwork } from '../network/network';

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

export const isDVM2Ethereum: BridgePredicateFn = (departure, arrival) => {
  return isPolkadotNetwork(departure) && isEthereumNetwork(arrival) && departure.mode === 'dvm';
};

export const isEthereum2DVM: BridgePredicateFn = (departure, arrival) => isDVM2Ethereum(arrival, departure);

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

export function isBridgeAvailable(from: ChainConfig, to: ChainConfig): boolean {
  const bridge = getBridge([from, to]);

  return !!bridge && bridge.status === 'available';
}

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig]
): Bridge<T> {
  const data = Array.isArray(source) ? source : ([source.from, source.to] as [ChainConfig, ChainConfig]);

  const direction = data.map((item) => {
    const asVertices = has(item, 'network') && has(item, 'mode');

    if (asVertices) {
      return pick(item as Vertices, ['network', 'mode']) as Vertices;
    }

    return item;
  });

  const bridge = BRIDGES.find((item) => isEqual(item.issuing, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    throw new Error(
      `Bridge from ${direction[0]?.name}(${direction[0].mode}) to ${direction[1]?.name}(${direction[1].mode}) is not exist`
    );
  }

  return bridge as Bridge<T>;
}

export function getBridgeComponent(type: 'crossChain' | 'record') {
  // eslint-disable-next-line complexity
  return (dir: CrossChainDirection) => {
    const { from, to } = dir;

    if (!from || !to) {
      return null;
    }

    const direction = [
      { name: from.name, mode: from.mode },
      { name: to.name, mode: to.mode },
    ] as [Departure, Departure];
    const bridge = getBridge([from, to]);

    if (!bridge || bridge.status === 'pending') {
      return ComingSoon;
    }

    switch (type) {
      case 'record':
        return isEqual(bridge.issuing, direction) ? bridge.IssuingRecordComponent : bridge.RedeemRecordComponent;
      default:
        return isEqual(bridge.issuing, direction)
          ? bridge.IssuingCrossChainComponent
          : bridge.RedeemCrossChainComponent;
    }
  };
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
