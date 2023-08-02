import { BridgeCategory, CrossChainPureDirection, Network } from 'shared/model';
import { getBridge } from './bridge';

type BridgePredicateFn = (departure: Network, arrival: Network) => boolean;

const predicate: (from: Network, to: Network) => BridgePredicateFn = (from, to) => (departure, arrival) =>
  departure === from && arrival === to;

const revert: (fn: BridgePredicateFn) => BridgePredicateFn = (fn: BridgePredicateFn) => (departure, arrival) =>
  fn(arrival, departure);

const or: (...fns: BridgePredicateFn[]) => (dep: Network, arr: Network) => boolean =
  (...fns) =>
  (departure, arrival) =>
    fns.some((fn) => fn(departure, arrival));

const isBridge =
  (...categories: BridgeCategory[]) =>
  (direction: CrossChainPureDirection) => {
    for (const category of categories) {
      const bridge = getBridge(direction, category);
      if (bridge.category === category) {
        return true;
      }
    }

    return false;
  };

export const isCBridge = isBridge('cBridge');

export const isXCM = isBridge('XCM');

export const isLpBridge = isBridge('helixLpBridge');

export const isL2Bridge = isBridge('l1tol2');

export const isLnBridge = isBridge('lnbridgev20-opposite', 'lnbridgev20-default');

export const isTransferBetween = (network1: Network, network2: Network) => {
  const isBacking = predicate(network1, network2);
  const isIssuing = revert(isBacking);

  return or(isBacking, isIssuing);
};
