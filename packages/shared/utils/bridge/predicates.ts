import { Network } from '../../model';
import { getBridge } from './bridge';

export type BridgePredicateFn = (departure: Network, arrival: Network) => boolean;

const predicate: (from: Network, to: Network) => BridgePredicateFn = (from, to) => (departure, arrival) =>
  departure === from && arrival === to;

const revert: (fn: BridgePredicateFn) => BridgePredicateFn = (fn: BridgePredicateFn) => (departure, arrival) =>
  fn(arrival, departure);

const or =
  (...fns: BridgePredicateFn[]) =>
  (departure: Network, arrival: Network) =>
    fns.some((fn) => fn(departure, arrival));

export const isCBridge: BridgePredicateFn = (departure, arrival) => {
  const bridge = getBridge([departure, arrival]);

  return bridge.category === 'cBridge';
};

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

export const isBSC2Arbitrum = predicate('bsc', 'arbitrum');
export const isArbitrum2BSC = revert(isBSC2Arbitrum);
export const isBSCArbitrum = or(isBSC2Arbitrum, isArbitrum2BSC);

export const isSubstrateDVM2SubstrateDVMIssuing = or(
  predicate('pangoro-dvm', 'pangolin-dvm'),
  predicate('darwinia-dvm', 'crab-dvm')
);
export const isSubstrateDVM2SubstrateDVMBacking = revert(isSubstrateDVM2SubstrateDVMIssuing);
export const isSubstrateDVMSubstrateDVM = or(isSubstrateDVM2SubstrateDVMIssuing, isSubstrateDVM2SubstrateDVMBacking);

export const isBSC2Astar = predicate('bsc', 'astar');
export const isAstar2BSC = predicate('astar', 'bsc');
export const isBSCAstar = or(isBSC2Astar, isAstar2BSC);

export const isBSC2Avalanche = predicate('bsc', 'avalanche');
export const isAvalanche2BSC = predicate('avalanche', 'bsc');
export const isBSCAvalanche = or(isBSC2Avalanche, isAvalanche2BSC);

export const isBSC2Optimism = predicate('bsc', 'optimism');
export const isOptimism2BSC = predicate('optimism', 'bsc');
export const isBSCOptimism = or(isBSC2Optimism, isOptimism2BSC);

export const isArbitrum2Astar = predicate('arbitrum', 'astar');
export const isAstar2Arbitrum = predicate('astar', 'arbitrum');
export const isArbitrumAstar = or(isArbitrum2Astar, isAstar2Arbitrum);

export const isArbitrum2Avalanche = predicate('arbitrum', 'avalanche');
export const isAvalanche2Arbitrum = predicate('avalanche', 'arbitrum');
export const isArbitrumAvalanche = or(isArbitrum2Avalanche, isAvalanche2Arbitrum);

export const isArbitrum2Optimism = predicate('arbitrum', 'optimism');
export const isOptimism2Arbitrum = predicate('optimism', 'arbitrum');
export const isArbitrumOptimism = or(isArbitrum2Optimism, isOptimism2Arbitrum);

export const isAstar2Avalanche = predicate('astar', 'avalanche');
export const isAvalanche2Astar = predicate('avalanche', 'astar');
export const isAstarAvalanche = or(isAstar2Avalanche, isAvalanche2Astar);

export const isAstar2Optimism = predicate('astar', 'optimism');
export const isOptimism2Astar = predicate('optimism', 'astar');
export const isAstarOptimism = or(isAstar2Optimism, isOptimism2Astar);

export const isAvalanche2Optimism = predicate('avalanche', 'optimism');
export const isOptimism2Avalanche = predicate('optimism', 'avalanche');
export const isAvalancheOptimism = or(isAvalanche2Optimism, isOptimism2Avalanche);

export const isPolygon2Astar = predicate('polygon', 'astar');
export const isAstar2Polygon = predicate('astar', 'polygon');
export const isPolygonAstar = or(isPolygon2Astar, isAstar2Polygon);

export const isEthereum2Astar = predicate('ethereum', 'astar');
export const isAstar2Ethereum = predicate('astar', 'ethereum');
export const isEthereumAstar = or(isEthereum2Astar, isAstar2Ethereum);

export const isEthereum2BSc = predicate('ethereum', 'bsc');
export const isBSC2Ethereum = predicate('bsc', 'ethereum');
export const isEthereumBSC = or(isEthereum2BSc, isBSC2Ethereum);

export const isEthereum2Avalanche = predicate('ethereum', 'avalanche');
export const isAvalanche2Ethereum = predicate('avalanche', 'ethereum');
export const isEthereumAvalanche = or(isEthereum2Avalanche, isAvalanche2Ethereum);

export const isEthereum2Arbitrum = predicate('ethereum', 'arbitrum');
export const isArbitrum2Ethereum = predicate('arbitrum', 'ethereum');
export const isEthereumArbitrum = or(isEthereum2Arbitrum, isArbitrum2Ethereum);

export const isEthereum2Optimism = predicate('ethereum', 'optimism');
export const isOptimism2Ethereum = predicate('optimism', 'ethereum');
export const isEthereumOptimism = or(isEthereum2Optimism, isOptimism2Ethereum);

export const isBSC2Polygon = predicate('bsc', 'polygon');
export const isPolygon2BSC = predicate('polygon', 'bsc');
export const isBSCPolygon = or(isBSC2Polygon, isPolygon2BSC);

export const isAvalanche2Polygon = predicate('avalanche', 'polygon');
export const isPolygon2Avalanche = predicate('polygon', 'avalanche');
export const isAvalanchePolygon = or(isAvalanche2Polygon, isPolygon2Avalanche);

export const isArbitrum2Polygon = predicate('arbitrum', 'polygon');
export const isPolygon2Arbitrum = predicate('polygon', 'arbitrum');
export const isArbitrumPolygon = or(isArbitrum2Polygon, isPolygon2Arbitrum);

export const isPolygon2Optimism = predicate('polygon', 'optimism');
export const isOptimism2Polygon = predicate('optimism', 'polygon');
export const isPolygonOptimism = or(isPolygon2Optimism, isOptimism2Polygon);

export const isCrabDVM2Bsc = predicate('crab-dvm', 'bsc');
export const isBsc2CrabDVM = predicate('bsc', 'crab-dvm');
export const isCrabDVMBsc = or(isCrabDVM2Bsc, isBsc2CrabDVM);

export const isCrabDVM2Arbitrum = predicate('crab-dvm', 'arbitrum');
export const isArbitrum2CrabDVM = predicate('arbitrum', 'crab-dvm');
export const isCrabDVMArbitrum = or(isCrabDVM2Arbitrum, isArbitrum2CrabDVM);

export const isCrabDVM2Astar = predicate('crab-dvm', 'astar');
export const isAstar2CrabDVM = predicate('astar', 'crab-dvm');
export const isCrabDVMAstar = or(isCrabDVM2Astar, isAstar2CrabDVM);

export const isCrabDVM2Avalanche = predicate('crab-dvm', 'avalanche');
export const isAvalanche2CrabDVM = predicate('avalanche', 'crab-dvm');
export const isCrabDVMAvalanche = or(isCrabDVM2Avalanche, isAvalanche2CrabDVM);

export const isCrabDVM2Optimism = predicate('crab-dvm', 'optimism');
export const isOptimism2CrabDVM = predicate('optimism', 'crab-dvm');
export const isCrabDVMOptimism = or(isCrabDVM2Optimism, isOptimism2CrabDVM);

export const isCrabParachain2Karura = predicate('crab-parachain', 'karura');
export const isKarura2CrabParachain = predicate('karura', 'crab-parachain');
export const isCrabParachainKarura = or(isCrabParachain2Karura, isKarura2CrabParachain);
