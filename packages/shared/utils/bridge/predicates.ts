import { Network } from '../../model';

export type BridgePredicateFn = (departure: Network, arrival: Network) => boolean;

const predicate: (from: Network, to: Network) => BridgePredicateFn = (from, to) => (departure, arrival) =>
  departure === from && arrival === to;

const revert: (fn: BridgePredicateFn) => BridgePredicateFn = (fn: BridgePredicateFn) => (departure, arrival) =>
  fn(arrival, departure);

const or =
  (...fns: BridgePredicateFn[]) =>
  (departure: Network, arrival: Network) =>
    fns.some((fn) => fn(departure, arrival));

/* -----------------------------generated auto------------------------------------- */

export const isSubstrate2SubstrateDVM = or(predicate('pangoro', 'pangolin-dvm'), predicate('darwinia', 'crab-dvm'));
export const isSubstrateDVM2Substrate = revert(isSubstrate2SubstrateDVM);
export const isSubstrateSubstrateDVM = or(isSubstrate2SubstrateDVM, isSubstrateDVM2Substrate);

export const isEthereum2Darwinia = or(predicate('ethereum', 'darwinia'), predicate('ropsten', 'pangolin'));
export const isDarwinia2Ethereum = revert(isEthereum2Darwinia);
export const isEthereumDarwinia = or(isEthereum2Darwinia, isDarwinia2Ethereum);

export const isSubstrate2DVM = or(
  predicate('darwinia', 'darwinia-dvm'),
  predicate('crab', 'crab-dvm'),
  predicate('pangolin', 'pangolin-dvm')
);
export const isDVM2Substrate = revert(isSubstrate2DVM);
export const isSubstrateDVM = or(isSubstrate2DVM, isDVM2Substrate);

export const isParachain2Substrate = or(
  predicate('crab-parachain', 'crab'),
  predicate('pangolin-parachain', 'pangolin')
);
export const isSubstrate2Parachain = revert(isParachain2Substrate);
export const isParachainSubstrate = or(isParachain2Substrate, isSubstrate2Parachain);

export const isCrabDVM2Heco = predicate('crab-dvm', 'heco');
export const isHeco2CrabDVM = revert(isCrabDVM2Heco);
export const isCrabDVMHeco = or(isCrabDVM2Heco, isHeco2CrabDVM);

export const isCrabDVM2Ethereum = predicate('crab-dvm', 'ethereum');
export const isEthereum2CrabDVM = revert(isCrabDVM2Ethereum);
export const isCrabDVMEthereum = or(isCrabDVM2Ethereum, isEthereum2CrabDVM);

export const isCrabDVM2Polygon = predicate('crab-dvm', 'polygon');
export const isPolygon2CrabDVM = revert(isCrabDVM2Polygon);
export const isCrabDVMPolygon = or(isCrabDVM2Polygon, isPolygon2CrabDVM);

export const isEthereum2Polygon = predicate('ethereum', 'polygon');
export const isPolygon2Ethereum = revert(isEthereum2Polygon);
export const isEthereumPolygon = or(isEthereum2Polygon, isPolygon2Ethereum);

export const isEthereum2Heco = predicate('ethereum', 'heco');
export const isHeco2Ethereum = revert(isEthereum2Heco);
export const isEthereumHeco = or(isEthereum2Heco, isHeco2Ethereum);

export const isHeco2Polygon = predicate('heco', 'polygon');
export const isPolygon2Heco = revert(isHeco2Polygon);
export const isHecoPolygon = or(isHeco2Polygon, isPolygon2Heco);

export const isBNBChain2Arbitrum = predicate('BNB Chain', 'arbitrum');
export const isArbitrum2BNBChain = revert(isBNBChain2Arbitrum);
export const isBNBChainArbitrum = or(isBNBChain2Arbitrum, isArbitrum2BNBChain);

export const isSubstrateDVM2SubstrateDVMIssuing = or(
  predicate('pangoro-dvm', 'pangolin-dvm'),
  predicate('darwinia-dvm', 'crab-dvm')
);
export const isSubstrateDVM2SubstrateDVMBacking = revert(isSubstrateDVM2SubstrateDVMIssuing);
export const isSubstrateDVMSubstrateDVM = or(isSubstrateDVM2SubstrateDVMIssuing, isSubstrateDVM2SubstrateDVMBacking);
