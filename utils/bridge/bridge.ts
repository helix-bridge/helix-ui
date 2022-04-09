import { has, isEqual, pick } from 'lodash';
import { ComingSoon } from '../../components/widget/ComingSoon';
import { AIRDROPS, BRIDGES } from '../../config/bridge';
import {
  ChainConfig,
  Departure,
  CrossChainDirection,
  Vertices,
  Bridge,
  BridgeConfig,
  ApiKeys,
  Api,
  ContractConfig,
  CrossType,
} from '../../model';
import { chainConfigToVertices, isDVM, isEthereumNetwork, isPolkadotNetwork } from '../network/network';

type BridgePredicateFn = (departure: Vertices, arrival: Vertices) => boolean;

export type DVMBridgeConfig = Required<
  BridgeConfig<ContractConfig & { proof: string }, Pick<Api<ApiKeys>, 'dapp' | 'evolution'>>
>;

export const isSubstrate2SubstrateDVM: BridgePredicateFn = (departure, arrival) => {
  return (
    isPolkadotNetwork(departure.network) &&
    isPolkadotNetwork(arrival.network) &&
    arrival.mode === 'dvm' &&
    arrival.network !== departure.network
  );
};

export const isSubstrateDVM2Substrate: BridgePredicateFn = (departure, arrival) =>
  isSubstrate2SubstrateDVM(arrival, departure);

export const isEthereum2Darwinia: BridgePredicateFn = (departure, arrival) => {
  return isEthereumNetwork(departure.network) && isPolkadotNetwork(arrival.network) && arrival.mode === 'native';
};

export const isDarwinia2Ethereum: BridgePredicateFn = (departure, arrival) => isEthereum2Darwinia(arrival, departure);

export const isDVM2Ethereum: BridgePredicateFn = (departure, arrival) => {
  return isPolkadotNetwork(departure.network) && isEthereumNetwork(arrival.network) && departure.mode === 'dvm';
};

export const isEthereum2DVM: BridgePredicateFn = (departure, arrival) => isDVM2Ethereum(arrival, departure);

export const isSubstrate2DVM: BridgePredicateFn = (departure, arrival) => {
  return (
    isPolkadotNetwork(departure.network) &&
    isPolkadotNetwork(arrival.network) &&
    arrival.mode === 'dvm' &&
    departure.network === arrival.network
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

export function hasBridge(
  source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig],
  type: CrossType = 'cross-chain'
): boolean {
  try {
    getBridge(source, type);

    return true;
  } catch (_) {
    return false;
  }
}

export function isBridgeAvailable(from: ChainConfig, to: ChainConfig, type: CrossType): boolean {
  const bridge = getBridge([from, to], type);

  return !!bridge && bridge.status === 'available';
}

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig],
  type: CrossType = 'cross-chain'
): Bridge<T> {
  const data = Array.isArray(source) ? source : ([source.from, source.to] as [ChainConfig, ChainConfig]);

  const direction = data.map((item) => {
    const asVertices = has(item, 'network') && has(item, 'mode');

    if (asVertices) {
      return pick(item as Vertices, ['network', 'mode']) as Vertices;
    }

    return chainConfigToVertices(item as ChainConfig);
  });

  const bridges: Bridge[] = type === 'cross-chain' ? BRIDGES : AIRDROPS;
  const bridge = bridges.find((item) => isEqual(item.issuing, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    throw new Error(
      `Bridge from ${direction[0]?.network}(${direction[0].mode}) to ${direction[1]?.network}(${direction[1].mode}) is not exist`
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

    const departure = chainConfigToVertices(from);
    const arrival = chainConfigToVertices(to);
    const direction = [departure, arrival] as [Departure, Departure];
    const bridge = getBridge(direction);

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
    (item) => item.status === 'available' && isEqual(item.departure, departure) && isDVM(item.arrival)
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
