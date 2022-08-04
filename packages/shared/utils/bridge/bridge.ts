import { isEqual } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { unknownUnavailable } from '../../config/bridges/unknown-unavailable';
import {
  Bridge,
  BridgeConfig,
  ChainConfig,
  ContractConfig,
  CrossChainDirection,
  Network,
  NullableFields,
} from '../../model';
import { getChainConfig, isDVMNetwork, isEthereumNetwork } from '../network/network';

export type BridgePredicateFn = (departure: Network, arrival: Network) => boolean;

export type DVMBridgeConfig = Required<BridgeConfig<ContractConfig & { proof: string }>>;

export const isSubstrate2SubstrateDVM: BridgePredicateFn = (departure, arrival) => {
  const is = departure === 'pangoro' || departure === 'darwinia';

  return is && isDVMNetwork(arrival);
};

export const isSubstrateDVM2Substrate: BridgePredicateFn = (departure, arrival) =>
  isSubstrate2SubstrateDVM(arrival, departure);

export const isEthereum2Darwinia: BridgePredicateFn = (departure, arrival) => {
  const is = arrival === 'darwinia' || arrival === 'pangolin';

  return is && isEthereumNetwork(departure) && !isDVMNetwork(departure);
};

export const isDarwinia2Ethereum: BridgePredicateFn = (departure, arrival) => isEthereum2Darwinia(arrival, departure);

export const isSubstrate2DVM: BridgePredicateFn = (departure, arrival) => {
  const is = departure === 'crab' || departure === 'pangolin';

  return is && isDVMNetwork(arrival) && arrival.startsWith(departure);
};

export const isDVM2Substrate: BridgePredicateFn = (departure, arrival) => isSubstrate2DVM(arrival, departure);

export const isParachain2Substrate: BridgePredicateFn = (departure, arrival) => {
  const is = departure === 'crab-parachain' || departure === 'pangolin-parachain';

  return is && departure.startsWith(arrival);
};

export const isSubstrate2Parachain: BridgePredicateFn = (departure, arrival) =>
  isParachain2Substrate(arrival, departure);

export const isCrabDVM2Heco: BridgePredicateFn = (departure, arrival) => departure === 'crab-dvm' && arrival === 'heco';
export const isHeco2CrabDVM: BridgePredicateFn = (departure, arrival) => isCrabDVM2Heco(arrival, departure);

export const isCrabDVM2Ethereum: BridgePredicateFn = (departure, arrival) =>
  departure === 'crab-dvm' && arrival === 'ethereum';
export const isEthereum2CrabDVM: BridgePredicateFn = (departure, arrival) => isCrabDVM2Ethereum(arrival, departure);

export const isCrabDVM2Polygon: BridgePredicateFn = (departure, arrival) =>
  departure === 'crab-dvm' && arrival === 'polygon';
export const isPolygon2CrabDVM: BridgePredicateFn = (departure, arrival) => isCrabDVM2Polygon(arrival, departure);

export const isEthereum2Polygon: BridgePredicateFn = (departure, arrival) =>
  departure === 'ethereum' && arrival === 'polygon';
export const isPolygon2Ethereum: BridgePredicateFn = (departure, arrival) => isEthereum2Polygon(arrival, departure);

export const isEthereum2Heco: BridgePredicateFn = (departure, arrival) =>
  departure === 'ethereum' && arrival === 'heco';
export const isHeco2Ethereum: BridgePredicateFn = (departure, arrival) => isEthereum2Heco(arrival, departure);

export const isSubstrateDVM2SubstrateDVMIssuing: BridgePredicateFn = (departure, arrival) => {
  return (
    (departure === 'pangoro-dvm' && arrival === 'pangolin-dvm') ||
    (departure === 'darwinia-dvm' && arrival === 'crab-dvm')
  );
};

export const isSubstrateDVM2SubstrateDVMBacking: BridgePredicateFn = (departure, arrival) => {
  return isSubstrateDVM2SubstrateDVMIssuing(arrival, departure);
};

/**
 * Shorthand functions for predication without direction
 */
const isCrossFactory =
  (...fns: BridgePredicateFn[]) =>
  (departure: Network, arrival: Network) =>
    fns.some((fn) => fn(departure, arrival));

export const isSubstrateSubstrateDVM: BridgePredicateFn = isCrossFactory(
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate
);

export const isEthereumDarwinia: BridgePredicateFn = isCrossFactory(isEthereum2Darwinia, isDarwinia2Ethereum);
export const isSubstrateDVM: BridgePredicateFn = isCrossFactory(isSubstrate2DVM, isDVM2Substrate);
export const isParachainSubstrate: BridgePredicateFn = isCrossFactory(isParachain2Substrate, isSubstrate2Parachain);
export const isCrabDVMHeco: BridgePredicateFn = isCrossFactory(isCrabDVM2Heco, isHeco2CrabDVM);
export const isCrabDVMEthereum: BridgePredicateFn = isCrossFactory(isCrabDVM2Ethereum, isEthereum2CrabDVM);
export const isCrabDVMPolygon: BridgePredicateFn = isCrossFactory(isCrabDVM2Polygon, isPolygon2CrabDVM);
export const isEthereumHeco: BridgePredicateFn = isCrossFactory(isEthereum2Heco, isHeco2Ethereum);
export const isEthereumPolygon: BridgePredicateFn = isCrossFactory(isEthereum2Polygon, isPolygon2Ethereum);

export const isSubstrateDVMSubstrateDVM: BridgePredicateFn = isCrossFactory(
  isSubstrateDVM2SubstrateDVMIssuing,
  isSubstrateDVM2SubstrateDVMBacking
);

function getBridgeOverviews(source: NullableFields<CrossChainDirection, 'from' | 'to'>) {
  const { from, to } = source;

  if (!from || !to) {
    return [];
  }

  const { cross: bridges } = from;

  return bridges.filter((bridge) => {
    const { partner } = bridge;

    return partner.symbol.toLowerCase() === to.symbol.toLowerCase() && isEqual(partner.name, to.meta.name);
  });
}

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Network | ChainConfig, Network | ChainConfig]
): Bridge<T> {
  const direction = Array.isArray(source)
    ? source.map((item) => (typeof item === 'object' ? item.name : (item as Network)))
    : [source.from, source.to].map((item) => {
        const conf = item.meta ?? getChainConfig(item.host);

        return conf.name;
      });

  const bridge = BRIDGES.find((item) => isEqual(item.issuing, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    console.log(
      '🚨 ~ file: bridge.ts ~ line 95 ~ Error',
      `Bridge from ${direction[0]} to ${direction[1]} is not exist`
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
