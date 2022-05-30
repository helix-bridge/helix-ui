import { FunctionComponent } from 'react';
import { darwiniaCrabDVM, pangoroPangolinDVM } from 'shared/config/bridge';
import { ethereumDarwinia, ropstenPangolin } from 'shared/config/bridges/ethereum-darwinia';
import { crabCrabDVM, pangolinPangolinDVM } from 'shared/config/bridges/substrate-dvm';
import { unknownUnavailable } from 'shared/config/bridges/unknown-unavailable';
import { Darwinia2Ethereum, Ethereum2Darwinia } from './ethereum-darwinia';
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
