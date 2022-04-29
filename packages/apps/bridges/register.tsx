import { FunctionComponent } from 'react';
import { darwiniaCrabDVM, pangoroPangolinDVM } from 'shared/config/bridge';
import { ethereumDarwinia, ropstenPangolin } from 'shared/config/bridges/ethereum-darwinia';
import { ethereumCrabDVM, ropstenPangolinDVM } from 'shared/config/bridges/ethereum-dvm';
import { crabCrabDVM, pangolinPangolinDVM } from 'shared/config/bridges/substrate-dvm';
import { unknownUnavailable } from 'shared/config/bridges/unknown-unavailable';
import {
  Darwinia2Ethereum,
  Darwinia2EthereumRecord,
  Ethereum2Darwinia,
  Ethereum2DarwiniaRecord,
} from './ethereum-darwinia';
import {
  DarwiniaDVM2Ethereum,
  DarwiniaDVM2EthereumRecord,
  Ethereum2DarwiniaDVM,
  Ethereum2DarwiniaDVMRecord,
} from './ethereum-darwiniaDVM';
import { DVM2Substrate, DVM2SubstrateRecord, Substrate2DVM, Substrate2DVMRecord } from './substrate-dvm';
import {
  Substrate2SubstrateDVM,
  Substrate2SubstrateDVMRecord,
  SubstrateDVM2Substrate,
  SubstrateDVM2SubstrateRecord,
} from './substrate-substrateDVM';
import {
  Unavailable2Unknown,
  Unavailable2UnknownRecord,
  Unknown2Unavailable,
  Unknown2UnavailableRecord,
} from './unknown-unavailable';

unknownUnavailable.setIssuingComponents(
  Unknown2Unavailable as FunctionComponent,
  Unknown2UnavailableRecord as FunctionComponent
);

unknownUnavailable.setRedeemComponents(
  Unavailable2Unknown as FunctionComponent,
  Unavailable2UnknownRecord as FunctionComponent
);

/**
 * ethereum <-> darwinia
 * ropsten <-> pangolin
 */
ethereumDarwinia.setIssuingComponents(
  Ethereum2Darwinia as FunctionComponent,
  Ethereum2DarwiniaRecord as FunctionComponent
);
ethereumDarwinia.setRedeemComponents(
  Darwinia2Ethereum as FunctionComponent,
  Darwinia2EthereumRecord as FunctionComponent
);
ropstenPangolin.setIssuingComponents(
  Ethereum2Darwinia as FunctionComponent,
  Ethereum2DarwiniaRecord as FunctionComponent
);
ropstenPangolin.setRedeemComponents(
  Darwinia2Ethereum as FunctionComponent,
  Darwinia2EthereumRecord as FunctionComponent
);

/**
 * substrate <-> substrate dvm
 * darwinia <-> crab dvm
 * pangoro <-> pangolin dvm
 */
darwiniaCrabDVM.setIssuingComponents(
  Substrate2SubstrateDVM as FunctionComponent,
  Substrate2SubstrateDVMRecord as FunctionComponent
);
darwiniaCrabDVM.setRedeemComponents(
  SubstrateDVM2Substrate as FunctionComponent,
  SubstrateDVM2SubstrateRecord as FunctionComponent
);
pangoroPangolinDVM.setIssuingComponents(
  Substrate2SubstrateDVM as FunctionComponent,
  Substrate2SubstrateDVMRecord as FunctionComponent
);
pangoroPangolinDVM.setRedeemComponents(
  SubstrateDVM2Substrate as FunctionComponent,
  SubstrateDVM2SubstrateRecord as FunctionComponent
);

/**
 * substrate <-> dvm
 * crab <-> crab dvm
 * pangolin <-> pangolin dvm
 */
crabCrabDVM.setIssuingComponents(Substrate2DVM as FunctionComponent, Substrate2DVMRecord as FunctionComponent);
crabCrabDVM.setRedeemComponents(DVM2Substrate as FunctionComponent, DVM2SubstrateRecord as FunctionComponent);
pangolinPangolinDVM.setIssuingComponents(Substrate2DVM as FunctionComponent, Substrate2DVMRecord as FunctionComponent);
pangolinPangolinDVM.setRedeemComponents(DVM2Substrate as FunctionComponent, DVM2SubstrateRecord as FunctionComponent);

/**
 * ethereum <-> crab dvm
 * ropsten <-> pangolin dvm
 */
ethereumCrabDVM.setIssuingComponents(
  Ethereum2DarwiniaDVM as FunctionComponent,
  Ethereum2DarwiniaDVMRecord as FunctionComponent
);
ethereumCrabDVM.setRedeemComponents(
  DarwiniaDVM2Ethereum as FunctionComponent,
  DarwiniaDVM2EthereumRecord as FunctionComponent
);
ropstenPangolinDVM.setIssuingComponents(
  Ethereum2DarwiniaDVM as FunctionComponent,
  Ethereum2DarwiniaDVMRecord as FunctionComponent
);
ropstenPangolinDVM.setRedeemComponents(
  DarwiniaDVM2Ethereum as FunctionComponent,
  DarwiniaDVM2EthereumRecord as FunctionComponent
);
