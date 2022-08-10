import { astarOptimism } from 'shared/config/bridges/astar-optimism';
import { astarAvalanche } from 'shared/config/bridges/astar-avalanche';
import { arbitrumOptimism } from 'shared/config/bridges/arbitrum-optimism';
import { arbitrumAvalanche } from 'shared/config/bridges/arbitrum-avalanche';
import { arbitrumAstar } from 'shared/config/bridges/arbitrum-astar';
import { bnbOptimism } from 'shared/config/bridges/bnb-optimism';
import { bnbAvalanche } from 'shared/config/bridges/bnb-avalanche';
import { bnbAstar } from 'shared/config/bridges/bnb-astar';
import { bnbArbitrum } from 'shared/config/bridges/bnb-arbitrum';
import { FunctionComponent } from 'react';
import { darwiniaCrabDVM, pangoroPangolinDVM } from 'shared/config/bridge';
import { crabDVMEthereum } from 'shared/config/bridges/crabDVM-ethereum';
import { crabDVMHeco } from 'shared/config/bridges/crabDVM-heco';
import { crabDVMPolygon } from 'shared/config/bridges/crabDVM-polygon';
import { ethereumDarwinia, ropstenPangolin } from 'shared/config/bridges/ethereum-darwinia';
import { ethereumHeco } from 'shared/config/bridges/ethereum-heco';
import { ethereumPolygon } from 'shared/config/bridges/ethereum-polygon';
import { hecoPolygon } from 'shared/config/bridges/heco-polygon';
import { parachainCrab, parachainPangolin } from 'shared/config/bridges/parachain-substrate';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from 'shared/config/bridges/substrate-dvm';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from 'shared/config/bridges/substrateDVM-substrateDVM';
import { unknownUnavailable } from 'shared/config/bridges/unknown-unavailable';
import { Astar2Optimism, Optimism2Astar } from './astar-optimism';
import { Astar2Avalanche, Avalanche2Astar } from './astar-avalanche';
import { Arbitrum2Optimism, Optimism2Arbitrum } from './arbitrum-optimism';
import { Arbitrum2Avalanche, Avalanche2Arbitrum } from './arbitrum-avalanche';
import { Arbitrum2Astar, Astar2Arbitrum } from './arbitrum-astar';
import { Bnb2Optimism, Optimism2Bnb } from './bnb-optimism';
import { Bnb2Avalanche, Avalanche2Bnb } from './bnb-avalanche';
import { Bnb2Astar, Astar2Bnb } from './bnb-astar';
import { Bnb2Arbitrum, Arbitrum2Bnb } from './bnb-arbitrum';
import { CrabDVM2Ethereum, Ethereum2CrabDVM } from './crabDVM-ethereum';
import { CrabDVM2Heco, Heco2CrabDVM } from './crabDVM-heco';
import { CrabDVM2Polygon, Polygon2CrabDVM } from './crabDVM-polygon';
import { Darwinia2Ethereum, Ethereum2Darwinia } from './ethereum-darwinia';
import { Ethereum2Heco, Heco2Ethereum } from './ethereum-heco';
import { Ethereum2Polygon, Polygon2Ethereum } from './ethereum-polygon';
import { Heco2Polygon, Polygon2Heco } from './heco-polygon';
import { Parachain2Substrate, Substrate2Parachain } from './parachain-substrate';
import { DVM2Substrate, Substrate2DVM } from './substrate-dvm';
import { Substrate2SubstrateDVM, SubstrateDVM2Substrate } from './substrate-substrateDVM';
import { SubstrateDVM2SubstrateDVM } from './substrateDVM-substrateDVM';
import { Unavailable2Unknown, Unknown2Unavailable } from './unknown-unavailable';

unknownUnavailable.setIssuingComponents(Unknown2Unavailable as FunctionComponent);
unknownUnavailable.setRedeemComponents(Unavailable2Unknown as FunctionComponent);

/**
 * ethereum <-> darwinia
 * ropsten <-> pangolin
 */
ethereumDarwinia.setIssuingComponents(Ethereum2Darwinia as FunctionComponent);
ethereumDarwinia.setRedeemComponents(Darwinia2Ethereum as FunctionComponent);
ropstenPangolin.setIssuingComponents(Ethereum2Darwinia as FunctionComponent);
ropstenPangolin.setRedeemComponents(Darwinia2Ethereum as FunctionComponent);

/**
 * substrate <-> substrate dvm
 * darwinia <-> crab dvm
 * pangoro <-> pangolin dvm
 */
darwiniaCrabDVM.setIssuingComponents(Substrate2SubstrateDVM as FunctionComponent);
darwiniaCrabDVM.setRedeemComponents(SubstrateDVM2Substrate as FunctionComponent);
pangoroPangolinDVM.setIssuingComponents(Substrate2SubstrateDVM as FunctionComponent);
pangoroPangolinDVM.setRedeemComponents(SubstrateDVM2Substrate as FunctionComponent);

/**
 * substrate <-> dvm
 * crab <-> crab dvm
 * pangolin <-> pangolin dvm
 */
crabCrabDVM.setIssuingComponents(Substrate2DVM as FunctionComponent);
crabCrabDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);
darwiniaDarwiniaDVM.setIssuingComponents(Substrate2DVM as FunctionComponent);
darwiniaDarwiniaDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);
pangolinPangolinDVM.setIssuingComponents(Substrate2DVM as FunctionComponent);
pangolinPangolinDVM.setRedeemComponents(DVM2Substrate as FunctionComponent);

/**
 * parachain <-> substrate
 * crab <-> crab parachain
 * pangolin <-> pangolin parachain
 */
parachainCrab.setIssuingComponents(Substrate2Parachain as FunctionComponent);
parachainCrab.setRedeemComponents(Parachain2Substrate as FunctionComponent);
parachainPangolin.setIssuingComponents(Substrate2Parachain as FunctionComponent);
parachainPangolin.setRedeemComponents(Parachain2Substrate as FunctionComponent);

/**
 * cBridge
 * crab dvm <-> heco
 */
crabDVMHeco.setIssuingComponents(CrabDVM2Heco as FunctionComponent);
crabDVMHeco.setRedeemComponents(Heco2CrabDVM as FunctionComponent);

crabDVMEthereum.setIssuingComponents(CrabDVM2Ethereum as FunctionComponent);
crabDVMEthereum.setRedeemComponents(Ethereum2CrabDVM as FunctionComponent);

crabDVMPolygon.setIssuingComponents(CrabDVM2Polygon as FunctionComponent);
crabDVMPolygon.setRedeemComponents(Polygon2CrabDVM as FunctionComponent);

ethereumHeco.setIssuingComponents(Ethereum2Heco as FunctionComponent);
ethereumHeco.setRedeemComponents(Heco2Ethereum as FunctionComponent);

ethereumPolygon.setIssuingComponents(Ethereum2Polygon as FunctionComponent);
ethereumPolygon.setRedeemComponents(Polygon2Ethereum as FunctionComponent);

hecoPolygon.setIssuingComponents(Heco2Polygon as FunctionComponent);
hecoPolygon.setRedeemComponents(Polygon2Heco as FunctionComponent);

/**
 * substrate dvm <-> substrate dvm
 */
darwiniaDVMCrabDVM.setIssuingComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);
darwiniaDVMCrabDVM.setRedeemComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);

pangoroDVMPangolinDVM.setIssuingComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);
pangoroDVMPangolinDVM.setRedeemComponents(SubstrateDVM2SubstrateDVM as FunctionComponent);

bnbArbitrum.setIssuingComponents(Bnb2Arbitrum as FunctionComponent);
bnbArbitrum.setRedeemComponents(Arbitrum2Bnb as FunctionComponent);

bnbAstar.setIssuingComponents(Bnb2Astar as FunctionComponent);
bnbAstar.setRedeemComponents(Astar2Bnb as FunctionComponent);

bnbAvalanche.setIssuingComponents(Bnb2Avalanche as FunctionComponent);
bnbAvalanche.setRedeemComponents(Avalanche2Bnb as FunctionComponent);

bnbOptimism.setIssuingComponents(Bnb2Optimism as FunctionComponent);
bnbOptimism.setRedeemComponents(Optimism2Bnb as FunctionComponent);

arbitrumAstar.setIssuingComponents(Arbitrum2Astar as FunctionComponent);
arbitrumAstar.setRedeemComponents(Astar2Arbitrum as FunctionComponent);

arbitrumAvalanche.setIssuingComponents(Arbitrum2Avalanche as FunctionComponent);
arbitrumAvalanche.setRedeemComponents(Avalanche2Arbitrum as FunctionComponent);

arbitrumOptimism.setIssuingComponents(Arbitrum2Optimism as FunctionComponent);
arbitrumOptimism.setRedeemComponents(Optimism2Arbitrum as FunctionComponent);

astarAvalanche.setIssuingComponents(Astar2Avalanche as FunctionComponent);
astarAvalanche.setRedeemComponents(Avalanche2Astar as FunctionComponent);

astarOptimism.setIssuingComponents(Astar2Optimism as FunctionComponent);
astarOptimism.setRedeemComponents(Optimism2Astar as FunctionComponent);
