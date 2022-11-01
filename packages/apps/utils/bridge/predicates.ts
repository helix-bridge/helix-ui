import { BridgeCategory, CrossChainPureDirection, Network } from 'shared/model';
import { getBridge } from './bridge';

export type BridgePredicateFn = (departure: Network, arrival: Network) => boolean;

const predicate: (from: Network, to: Network) => BridgePredicateFn = (from, to) => (departure, arrival) =>
  departure === from && arrival === to;

const revert: (fn: BridgePredicateFn) => BridgePredicateFn = (fn: BridgePredicateFn) => (departure, arrival) =>
  fn(arrival, departure);

const or: (...fns: BridgePredicateFn[]) => (dep: Network, arr: Network) => boolean =
  (...fns) =>
  (departure, arrival) =>
    fns.some((fn) => fn(departure, arrival));

const isBridge = (category: BridgeCategory) => (direction: CrossChainPureDirection) => {
  const bridge = getBridge(direction, category);

  return bridge.category === category;
};

export const isCBridge = isBridge('cBridge');

export const isXCM = isBridge('XCM');

/* -----------------------------generated auto------------------------------------- */

const isSubstrate2SubstrateDVM = or(predicate('pangoro', 'pangolin-dvm'), predicate('darwinia', 'crab-dvm'));
const isSubstrateDVM2Substrate = revert(isSubstrate2SubstrateDVM);
export const isSubstrateSubstrateDVM = or(isSubstrate2SubstrateDVM, isSubstrateDVM2Substrate);

const isSubstrate2DVM = or(
  predicate('darwinia', 'darwinia-dvm'),
  predicate('crab', 'crab-dvm'),
  predicate('pangolin', 'pangolin-dvm')
);
const isDVM2Substrate = revert(isSubstrate2DVM);
export const isSubstrateDVM = or(isSubstrate2DVM, isDVM2Substrate);

const isSubstrateParachain2Substrate = or(
  predicate('crab-parachain', 'crab'),
  predicate('pangolin-parachain', 'pangolin')
);
const isSubstrate2SubstrateParachain = revert(isSubstrateParachain2Substrate);
export const isSubstrateSubstrateParachain = or(isSubstrateParachain2Substrate, isSubstrate2SubstrateParachain);

const isCrabDVM2Heco = predicate('crab-dvm', 'heco');
const isHeco2CrabDVM = revert(isCrabDVM2Heco);
export const isCrabDVMHeco = or(isCrabDVM2Heco, isHeco2CrabDVM);

const isSubstrateDVM2SubstrateDVMIssuing = or(
  predicate('pangoro-dvm', 'pangolin-dvm'),
  predicate('pangoro-dvm', 'pangoro-dvm'),
  predicate('darwinia-dvm', 'crab-dvm'),
  predicate('darwinia-dvm', 'darwinia-dvm')
);
const isSubstrateDVM2SubstrateDVMBacking = revert(isSubstrateDVM2SubstrateDVMIssuing);
export const isSubstrateDVMSubstrateDVM = or(isSubstrateDVM2SubstrateDVMIssuing, isSubstrateDVM2SubstrateDVMBacking);

const isSubstrateDVM2Ethereum = or(predicate('darwinia-dvm', 'ethereum'), predicate('pangoro-dvm', 'goerli'));
const isEthereum2SubstrateDVM = or(predicate('ethereum', 'darwinia-dvm'), predicate('goerli', 'pangoro-dvm'));
export const isSubstrateDVMEthereum = or(isSubstrateDVM2Ethereum, isEthereum2SubstrateDVM);
