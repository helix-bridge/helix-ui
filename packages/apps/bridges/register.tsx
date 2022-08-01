import { FunctionComponent } from 'react';
import { darwiniaCrabDVM, pangoroPangolinDVM } from 'shared/config/bridge';
import { crabDVMEthereum } from 'shared/config/bridges/crabDVM-ethereum';
import { crabDVMHeco } from 'shared/config/bridges/crabDVM-heco';
import { crabDVMPolygon } from 'shared/config/bridges/crabDVM-polygon';
import { ethereumDarwinia, ropstenPangolin } from 'shared/config/bridges/ethereum-darwinia';
import { ethereumHeco } from 'shared/config/bridges/ethereum-heco';
import { ethereumPolygon } from 'shared/config/bridges/ethereum-polygon';
import { parachainCrab, parachainPangolin } from 'shared/config/bridges/parachain-substrate';
import { crabCrabDVM, pangolinPangolinDVM } from 'shared/config/bridges/substrate-dvm';
import { unknownUnavailable } from 'shared/config/bridges/unknown-unavailable';
import { CrabDVM2Ethereum, Ethereum2CrabDVM } from './crabDVM-ethereum';
import { CrabDVM2Heco, Heco2CrabDVM } from './crabDVM-heco';
import { CrabDVM2Polygon, Polygon2CrabDVM } from './crabDVM-polygon';
import { Darwinia2Ethereum, Ethereum2Darwinia } from './ethereum-darwinia';
import { Ethereum2Heco, Heco2Ethereum } from './ethereum-heco';
import { Ethereum2Polygon, Polygon2Ethereum } from './ethereum-polygon';
import { Parachain2Substrate, Substrate2Parachain } from './parachain-substrate';
import { DVM2Substrate, Substrate2DVM } from './substrate-dvm';
import { Substrate2SubstrateDVM, SubstrateDVM2Substrate } from './substrate-substrateDVM';
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
