import { crabParachainMoonriver } from 'shared/config/bridges/crabParachain-moonriver';
import { FunctionComponent } from 'react';
import { darwiniaCrabDVM, pangoroPangolinDVM } from 'shared/config/bridge';
import { arbitrumAstar } from 'shared/config/bridges/arbitrum-astar';
import { arbitrumAvalanche } from 'shared/config/bridges/arbitrum-avalanche';
import { arbitrumOptimism } from 'shared/config/bridges/arbitrum-optimism';
import { arbitrumPolygon } from 'shared/config/bridges/arbitrum-polygon';
import { astarAvalanche } from 'shared/config/bridges/astar-avalanche';
import { astarOptimism } from 'shared/config/bridges/astar-optimism';
import { avalancheOptimism } from 'shared/config/bridges/avalanche-optimism';
import { avalanchePolygon } from 'shared/config/bridges/avalanche-polygon';
import { bscArbitrum } from 'shared/config/bridges/bsc-arbitrum';
import { bscAstar } from 'shared/config/bridges/bsc-astar';
import { bscAvalanche } from 'shared/config/bridges/bsc-avalanche';
import { bscOptimism } from 'shared/config/bridges/bsc-optimism';
import { bscPolygon } from 'shared/config/bridges/bsc-polygon';
import { crabDVMAstar } from 'shared/config/bridges/crabDVM-astar';
import { crabDVMEthereum } from 'shared/config/bridges/crabDVM-ethereum';
import { crabDVMHeco } from 'shared/config/bridges/crabDVM-heco';
import { crabDVMPolygon } from 'shared/config/bridges/crabDVM-polygon';
import { crabParachainKarura } from 'shared/config/bridges/crabParachain-karura';
import { ethereumArbitrum } from 'shared/config/bridges/ethereum-arbitrum';
import { ethereumAstar } from 'shared/config/bridges/ethereum-astar';
import { ethereumAvalanche } from 'shared/config/bridges/ethereum-avalanche';
import { ethereumBSC } from 'shared/config/bridges/ethereum-bsc';
import { ethereumDarwinia, ropstenPangolin } from 'shared/config/bridges/ethereum-darwinia';
import { ethereumHeco } from 'shared/config/bridges/ethereum-heco';
import { ethereumOptimism } from 'shared/config/bridges/ethereum-optimism';
import { ethereumPolygon } from 'shared/config/bridges/ethereum-polygon';
import { hecoPolygon } from 'shared/config/bridges/heco-polygon';
import { crabCrabParachain, pangolinPangolinParachain } from 'shared/config/bridges/substrate-substrateParachain';
import { polygonAstar } from 'shared/config/bridges/polygon-astar';
import { polygonOptimism } from 'shared/config/bridges/polygon-optimism';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from 'shared/config/bridges/substrate-dvm';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from 'shared/config/bridges/substrateDVM-substrateDVM';
import { unknownUnavailable } from 'shared/config/bridges/unknown-unavailable';
import { CrabParachain2Moonriver, Moonriver2CrabParachain } from './xcm/crabParachain-moonriver';
import { Arbitrum2Astar, Astar2Arbitrum } from './celer/arbitrum-astar';
import { Arbitrum2Avalanche, Avalanche2Arbitrum } from './celer/arbitrum-avalanche';
import { Arbitrum2Optimism, Optimism2Arbitrum } from './celer/arbitrum-optimism';
import { Arbitrum2Polygon, Polygon2Arbitrum } from './celer/arbitrum-polygon';
import { Astar2Avalanche, Avalanche2Astar } from './celer/astar-avalanche';
import { Astar2Optimism, Optimism2Astar } from './celer/astar-optimism';
import { Avalanche2Optimism, Optimism2Avalanche } from './celer/avalanche-optimism';
import { Avalanche2Polygon, Polygon2Avalanche } from './celer/avalanche-polygon';
import { Arbitrum2BSC, BSC2Arbitrum } from './celer/bsc-arbitrum';
import { Astar2BSC, BSC2Astar } from './celer/bsc-astar';
import { Avalanche2BSC, BSC2Avalanche } from './celer/bsc-avalanche';
import { BSC2Optimism, Optimism2BSC } from './celer/bsc-optimism';
import { BSC2Polygon, Polygon2BSC } from './celer/bsc-polygon';
import { Astar2CrabDVM, CrabDVM2Astar } from './celer/crabDVM-astar';
import { CrabDVM2Ethereum, Ethereum2CrabDVM } from './celer/crabDVM-ethereum';
import { CrabDVM2Heco, Heco2CrabDVM } from './celer/crabDVM-heco';
import { CrabDVM2Polygon, Polygon2CrabDVM } from './celer/crabDVM-polygon';
import { CrabParachain2Karura, Karura2CrabParachain } from './xcm/crabParachain-karura';
import { Arbitrum2Ethereum, Ethereum2Arbitrum } from './celer/ethereum-arbitrum';
import { Astar2Ethereum, Ethereum2Astar } from './celer/ethereum-astar';
import { Avalanche2Ethereum, Ethereum2Avalanche } from './celer/ethereum-avalanche';
import { BSC2Ethereum, Ethereum2BSC } from './celer/ethereum-bsc';
import { Darwinia2Ethereum, Ethereum2Darwinia } from './helix/ethereum-darwinia';
import { Ethereum2Heco, Heco2Ethereum } from './celer/ethereum-heco';
import { Ethereum2Optimism, Optimism2Ethereum } from './celer/ethereum-optimism';
import { Ethereum2Polygon, Polygon2Ethereum } from './celer/ethereum-polygon';
import { Heco2Polygon, Polygon2Heco } from './celer/heco-polygon';
import { Parachain2Substrate, Substrate2Parachain } from './helix/substrate-substrateParachain';
import { Astar2Polygon, Polygon2Astar } from './celer/polygon-astar';
import { Optimism2Polygon, Polygon2Optimism } from './celer/polygon-optimism';
import { DVM2Substrate, Substrate2DVM } from './helix/substrate-dvm';
import { Substrate2SubstrateDVM, SubstrateDVM2Substrate } from './helix/substrate-substrateDVM';
import { SubstrateDVM2SubstrateDVM } from './helix/substrateDVM-substrateDVM';
import { Unavailable2Unknown, Unknown2Unavailable } from './unknown-unavailable';

unknownUnavailable.setIssueComponents(Unknown2Unavailable as FunctionComponent);
unknownUnavailable.setRedeemComponents(Unavailable2Unknown as FunctionComponent);

/**
 * ethereum <-> darwinia
 * ropsten <-> pangolin
 */
ethereumDarwinia.setIssueComponents(Ethereum2Darwinia as FunctionComponent);
ethereumDarwinia.setRedeemComponents(Darwinia2Ethereum as FunctionComponent);
ropstenPangolin.setIssueComponents(Ethereum2Darwinia as FunctionComponent);
ropstenPangolin.setRedeemComponents(Darwinia2Ethereum as FunctionComponent);

/**
 * substrate <-> substrate dvm
 * darwinia <-> crab dvm
 * pangoro <-> pangolin dvm
 */
darwiniaCrabDVM.setIssueComponents(Substrate2SubstrateDVM as FunctionComponent);
darwiniaCrabDVM.setRedeemComponents(SubstrateDVM2Substrate as FunctionComponent);
pangoroPangolinDVM.setIssueComponents(Substrate2SubstrateDVM as FunctionComponent);
pangoroPangolinDVM.setRedeemComponents(SubstrateDVM2Substrate as FunctionComponent);

/**
 * substrate <-> dvm
 * crab <-> crab dvm
 * pangolin <-> pangolin dvm
 */
crabCrabDVM.setIssueComponents(Substrate2DVM as FunctionComponent);
crabCrabDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);
darwiniaDarwiniaDVM.setIssueComponents(Substrate2DVM as FunctionComponent);
darwiniaDarwiniaDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);
pangolinPangolinDVM.setIssueComponents(Substrate2DVM as FunctionComponent);
pangolinPangolinDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);

/**
 * parachain <-> substrate
 * crab <-> crab parachain
 * pangolin <-> pangolin parachain
 */
crabCrabParachain.setIssueComponents(Substrate2Parachain as FunctionComponent);
crabCrabParachain.setRedeemComponents(Parachain2Substrate as FunctionComponent);
pangolinPangolinParachain.setIssueComponents(Substrate2Parachain as FunctionComponent);
pangolinPangolinParachain.setRedeemComponents(Parachain2Substrate as FunctionComponent);

/**
 * cBridge
 * crab dvm <-> heco
 */
crabDVMHeco.setIssueComponents(CrabDVM2Heco as FunctionComponent);
crabDVMHeco.setRedeemComponents(Heco2CrabDVM as FunctionComponent);

crabDVMEthereum.setIssueComponents(CrabDVM2Ethereum as FunctionComponent);
crabDVMEthereum.setRedeemComponents(Ethereum2CrabDVM as FunctionComponent);

crabDVMPolygon.setIssueComponents(CrabDVM2Polygon as FunctionComponent);
crabDVMPolygon.setRedeemComponents(Polygon2CrabDVM as FunctionComponent);

ethereumHeco.setIssueComponents(Ethereum2Heco as FunctionComponent);
ethereumHeco.setRedeemComponents(Heco2Ethereum as FunctionComponent);

ethereumPolygon.setIssueComponents(Ethereum2Polygon as FunctionComponent);
ethereumPolygon.setRedeemComponents(Polygon2Ethereum as FunctionComponent);

hecoPolygon.setIssueComponents(Heco2Polygon as FunctionComponent);
hecoPolygon.setRedeemComponents(Polygon2Heco as FunctionComponent);

/**
 * substrate dvm <-> substrate dvm
 */
darwiniaDVMCrabDVM.setIssueComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);
darwiniaDVMCrabDVM.setRedeemComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);

pangoroDVMPangolinDVM.setIssueComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);
pangoroDVMPangolinDVM.setRedeemComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);

bscArbitrum.setIssueComponents(BSC2Arbitrum as FunctionComponent);
bscArbitrum.setRedeemComponents(Arbitrum2BSC as FunctionComponent);

bscAstar.setIssueComponents(BSC2Astar as FunctionComponent);
bscAstar.setRedeemComponents(Astar2BSC as FunctionComponent);

bscAvalanche.setIssueComponents(BSC2Avalanche as FunctionComponent);
bscAvalanche.setRedeemComponents(Avalanche2BSC as FunctionComponent);

bscOptimism.setIssueComponents(BSC2Optimism as FunctionComponent);
bscOptimism.setRedeemComponents(Optimism2BSC as FunctionComponent);

arbitrumAstar.setIssueComponents(Arbitrum2Astar as FunctionComponent);
arbitrumAstar.setRedeemComponents(Astar2Arbitrum as FunctionComponent);

arbitrumAvalanche.setIssueComponents(Arbitrum2Avalanche as FunctionComponent);
arbitrumAvalanche.setRedeemComponents(Avalanche2Arbitrum as FunctionComponent);

arbitrumOptimism.setIssueComponents(Arbitrum2Optimism as FunctionComponent);
arbitrumOptimism.setRedeemComponents(Optimism2Arbitrum as FunctionComponent);

astarAvalanche.setIssueComponents(Astar2Avalanche as FunctionComponent);
astarAvalanche.setRedeemComponents(Avalanche2Astar as FunctionComponent);

astarOptimism.setIssueComponents(Astar2Optimism as FunctionComponent);
astarOptimism.setRedeemComponents(Optimism2Astar as FunctionComponent);

avalancheOptimism.setIssueComponents(Avalanche2Optimism as FunctionComponent);
avalancheOptimism.setRedeemComponents(Optimism2Avalanche as FunctionComponent);

polygonAstar.setIssueComponents(Polygon2Astar as FunctionComponent);
polygonAstar.setRedeemComponents(Astar2Polygon as FunctionComponent);

ethereumAstar.setIssueComponents(Ethereum2Astar as FunctionComponent);
ethereumAstar.setRedeemComponents(Astar2Ethereum as FunctionComponent);

ethereumBSC.setIssueComponents(Ethereum2BSC as FunctionComponent);
ethereumBSC.setRedeemComponents(BSC2Ethereum as FunctionComponent);

ethereumAvalanche.setIssueComponents(Ethereum2Avalanche as FunctionComponent);
ethereumAvalanche.setRedeemComponents(Avalanche2Ethereum as FunctionComponent);

ethereumArbitrum.setIssueComponents(Ethereum2Arbitrum as FunctionComponent);
ethereumArbitrum.setRedeemComponents(Arbitrum2Ethereum as FunctionComponent);

ethereumOptimism.setIssueComponents(Ethereum2Optimism as FunctionComponent);
ethereumOptimism.setRedeemComponents(Optimism2Ethereum as FunctionComponent);

bscPolygon.setIssueComponents(BSC2Polygon as FunctionComponent);
bscPolygon.setRedeemComponents(Polygon2BSC as FunctionComponent);

avalanchePolygon.setIssueComponents(Avalanche2Polygon as FunctionComponent);
avalanchePolygon.setRedeemComponents(Polygon2Avalanche as FunctionComponent);

arbitrumPolygon.setIssueComponents(Arbitrum2Polygon as FunctionComponent);
arbitrumPolygon.setRedeemComponents(Polygon2Arbitrum as FunctionComponent);

polygonOptimism.setIssueComponents(Polygon2Optimism as FunctionComponent);
polygonOptimism.setRedeemComponents(Optimism2Polygon as FunctionComponent);

crabDVMAstar.setIssueComponents(CrabDVM2Astar as FunctionComponent);
crabDVMAstar.setRedeemComponents(Astar2CrabDVM as FunctionComponent);

crabParachainKarura.setIssueComponents(CrabParachain2Karura as FunctionComponent);
crabParachainKarura.setRedeemComponents(Karura2CrabParachain as FunctionComponent);

crabParachainMoonriver.setIssueComponents(CrabParachain2Moonriver as FunctionComponent);
crabParachainMoonriver.setRedeemComponents(Moonriver2CrabParachain as FunctionComponent);
