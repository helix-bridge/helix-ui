import { CHAIN_TYPE } from 'shared/config/env';
import { arbitrumAstar } from '../bridges/cbridge/arbitrum-astar/config';
import { arbitrumAvalanche } from '../bridges/cbridge/arbitrum-avalanche/config';
import { arbitrumOptimism } from '../bridges/cbridge/arbitrum-optimism/config';
import { arbitrumPolygon } from '../bridges/cbridge/arbitrum-polygon/config';
import { astarAvalanche } from '../bridges/cbridge/astar-avalanche/config';
import { astarOptimism } from '../bridges/cbridge/astar-optimism/config';
import { avalancheOptimism } from '../bridges/cbridge/avalanche-optimism/config';
import { avalanchePolygon } from '../bridges/cbridge/avalanche-polygon/config';
import { bscArbitrum } from '../bridges/cbridge/bsc-arbitrum/config';
import { bscAstar } from '../bridges/cbridge/bsc-astar/config';
import { bscAvalanche } from '../bridges/cbridge/bsc-avalanche/config';
import { bscOptimism } from '../bridges/cbridge/bsc-optimism/config';
import { bscPolygon } from '../bridges/cbridge/bsc-polygon/config';
import { crabDVMAstar } from '../bridges/cbridge/crabDVM-astar/config';
import { crabDVMEthereum } from '../bridges/cbridge/crabDVM-ethereum/config';
import { crabDVMHeco } from '../bridges/cbridge/crabDVM-heco/config';
import { crabDVMPolygon } from '../bridges/cbridge/crabDVM-polygon/config';
import { ethereumArbitrum } from '../bridges/cbridge/ethereum-arbitrum/config';
import { ethereumAstar } from '../bridges/cbridge/ethereum-astar/config';
import { ethereumAvalanche } from '../bridges/cbridge/ethereum-avalanche/config';
import { ethereumBSC } from '../bridges/cbridge/ethereum-bsc/config';
import { ethereumHeco } from '../bridges/cbridge/ethereum-heco/config';
import { ethereumOptimism } from '../bridges/cbridge/ethereum-optimism/config';
import { ethereumPolygon } from '../bridges/cbridge/ethereum-polygon/config';
import { hecoPolygon } from '../bridges/cbridge/heco-polygon/config';
import { polygonAstar } from '../bridges/cbridge/polygon-astar/config';
import { polygonOptimism } from '../bridges/cbridge/polygon-optimism/config';
import { crabDVMcrabDVM, crabDVMDarwiniaDVM } from '../bridges/helix/crabDVM-darwiniaDVM/config/bridge';
import { darwiniaDVMCrabDVM, darwiniaDVMDarwiniaDVM } from '../bridges/helix/darwiniaDVM-crabDVM/config/bridge';
import { darwiniaDVMEthereum } from '../bridges/helix/substrateDVM-ethereum/config/bridge';
import { crabParachainKarura } from '../bridges/xcm/crabParachain-karura/config/bridge';
import { crabParachainMoonriver } from '../bridges/xcm/crabParachain-moonriver/config/bridge';
import { shidenKhala } from '../bridges/xcm/shiden-khala/config';
import { khalaShiden } from '../bridges/xcm/khala-shiden/config';
import { shidenKarura } from '../bridges/xcm/shiden-karura/config';
import { karuraShiden } from '../bridges/xcm/karura-shiden/config';
import { shidenMoonriver } from '../bridges/xcm/shiden-moonriver/config';
import { moonriverShiden } from '../bridges/xcm/moonriver-shiden/config';
import { moonriverKarura } from '../bridges/xcm/moonriver-karura/config';
import { karuraMoonriver } from '../bridges/xcm/karura-moonriver/config';
import { khalaKarura } from '../bridges/xcm/khala-karura/config';
import { karuraKhala } from '../bridges/xcm/karura-khala/config';
import { moonriverKhala } from '../bridges/xcm/moonriver-khala/config';
import { khalaMoonriver } from '../bridges/xcm/khala-moonriver/config';
import { crabDarwinia } from '../bridges/helixlp/crab-darwinia/config';
import { darwiniaEthereum } from '../bridges/helixlp/darwinia-ethereum/config';
import { arbitrumGoerli, arbitrumEthereum } from '../bridges/helixlp/arbitrum-ethereum/config';
import { goerliArbitrumL2, ethereumArbitrumL2 } from '../bridges/l1tol2/ethereum-arbitrum/config';
import { arbitrumGoerliLnBridge, arbitrumEthereumLnBridge } from '../bridges/lnbridge/arbitrum-ethereum/config';
import { goerliArbitrumLnBridge, ethereumArbitrumLnBridge } from '../bridges/lnbridge/ethereum-arbitrum/config';
import { goerliZksyncGoerliLnBridge } from '../bridges/lnbridge/ethereum-zksync/config';
import { zksyncGoerliGoerliLnBridge } from '../bridges/lnbridge/zksync-ethereum/config';
import { goerliLineaGoerliLnBridge } from '../bridges/lnbridge/ethereum-linea/config';
import { lineaGoerliGoerliLnBridge } from '../bridges/lnbridge/linea-ethereum/config';
import { arbitrumGoerliLineaGoerliLnBridge } from '../bridges/lnbridge/arbitrum-linea/config';
import { lineaGoerliArbitrumGoerliLnBridge } from '../bridges/lnbridge/linea-arbitrum/config';
import { arbitrumGoerliZksyncGoerliLnBridge } from '../bridges/lnbridge/arbitrum-zksync/config';
import { zksyncGoerliArbitrumGoerliLnBridge } from '../bridges/lnbridge/zksync-arbitrum/config';
import { lineaGoerliZksyncGoerliLnBridge } from '../bridges/lnbridge/linea-zksync/config';
import { zksyncGoerliLineaGoerliLnBridge } from '../bridges/lnbridge/zksync-linea/config';
import { mantleGoerliArbitrumGoerliLnBridge } from '../bridges/lnbridge/mantle-arbitrum/config';
import { arbitrumGoerliMantleGoerliLnBridge } from '../bridges/lnbridge/arbitrum-mantle/config';
import { mantleGoerliGoerliLnBridge } from '../bridges/lnbridge/mantle-ethereum/config';
import { goerliMantleGoerliLnBridge } from '../bridges/lnbridge/ethereum-mantle/config';
import { mantleGoerliLineaGoerliLnBridge } from '../bridges/lnbridge/mantle-linea/config';
import { lineaGoerliMantleGoerliLnBridge } from '../bridges/lnbridge/linea-mantle/config';

const formalBridges = [
  arbitrumAstar,
  arbitrumAvalanche,
  arbitrumOptimism,
  arbitrumPolygon,
  astarAvalanche,
  astarOptimism,
  avalancheOptimism,
  avalanchePolygon,
  bscArbitrum,
  bscAstar,
  bscAvalanche,
  bscOptimism,
  bscPolygon,
  crabDVMAstar,
  crabDVMcrabDVM,
  crabDVMDarwiniaDVM,
  crabDVMEthereum,
  crabDVMHeco,
  crabDVMPolygon,
  crabParachainKarura,
  crabParachainMoonriver,
  darwiniaDVMCrabDVM,
  darwiniaDVMDarwiniaDVM,
  darwiniaDVMEthereum,
  ethereumAstar,
  ethereumAvalanche,
  ethereumBSC,
  ethereumHeco,
  ethereumOptimism,
  ethereumPolygon,
  hecoPolygon,
  karuraMoonriver,
  karuraShiden,
  karuraKhala,
  khalaKarura,
  khalaMoonriver,
  khalaShiden,
  moonriverKarura,
  moonriverKhala,
  moonriverShiden,
  polygonAstar,
  polygonOptimism,
  shidenKarura,
  shidenKhala,
  shidenMoonriver,
  crabDarwinia,
  darwiniaEthereum,
  arbitrumEthereum,
  arbitrumEthereumLnBridge,
  ethereumArbitrumLnBridge,
  ethereumArbitrumL2,
  ethereumArbitrum,
];

const testBridges = [
  arbitrumGoerli,
  arbitrumGoerliLnBridge,
  goerliArbitrumLnBridge,
  goerliZksyncGoerliLnBridge,
  zksyncGoerliGoerliLnBridge,
  goerliLineaGoerliLnBridge,
  lineaGoerliGoerliLnBridge,
  goerliArbitrumL2,
  arbitrumGoerliLineaGoerliLnBridge,
  lineaGoerliArbitrumGoerliLnBridge,
  arbitrumGoerliZksyncGoerliLnBridge,
  zksyncGoerliArbitrumGoerliLnBridge,
  lineaGoerliZksyncGoerliLnBridge,
  zksyncGoerliLineaGoerliLnBridge,
  mantleGoerliArbitrumGoerliLnBridge,
  arbitrumGoerliMantleGoerliLnBridge,
  mantleGoerliGoerliLnBridge,
  goerliMantleGoerliLnBridge,
  mantleGoerliLineaGoerliLnBridge,
  lineaGoerliMantleGoerliLnBridge,
];

export const BRIDGES = (() => {
  switch (CHAIN_TYPE) {
    case 'all':
      return [...formalBridges, ...testBridges];
    case 'formal':
      return formalBridges;
    case 'test':
      return testBridges;
    default:
      return [];
  }
})();
