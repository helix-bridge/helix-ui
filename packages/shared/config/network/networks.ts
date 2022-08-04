import { DVMNetwork, EthereumTypeNetwork, PolkadotTypeNetwork } from '../../model';
import { crabConfig } from './crab';
import { crabDVMConfig } from './crab-dvm';
import { crabParachainConfig } from './crab-parachain';
import { darwiniaConfig } from './darwinia';
import { darwiniaDVMConfig } from './darwinia-dvm';
import { ethereumConfig } from './ethereum';
import { hecoConfig } from './heco';
import { pangolinConfig } from './pangolin';
import { pangolinDVMConfig } from './pangolin-dvm';
import { pangolinParachainConfig } from './pangolin-parachain';
import { pangoroConfig } from './pangoro';
import { pangoroDVMConfig } from './pangoro-dvm';
import { polygonConfig } from './polygon';
import { ropstenConfig } from './ropsten';

export const SYSTEM_ChAIN_CONFIGURATIONS = [
  crabConfig,
  crabDVMConfig,
  crabParachainConfig,
  darwiniaConfig,
  darwiniaDVMConfig,
  ethereumConfig,
  hecoConfig,
  pangolinConfig,
  pangolinDVMConfig,
  pangolinParachainConfig,
  pangoroConfig,
  pangoroDVMConfig,
  polygonConfig,
  ropstenConfig,
];

export const knownPolkadotNetworks: PolkadotTypeNetwork[] = [
  'crab',
  'darwinia',
  'pangolin',
  'pangoro',
  'polkadot',
  'pangolin-parachain',
  'crab-parachain',
];

export const knownDVMNetworks: DVMNetwork[] = ['crab-dvm', 'pangolin-dvm', 'pangoro-dvm', 'darwinia-dvm'];

export const knownEthereumNetworks: (DVMNetwork | EthereumTypeNetwork)[] = [
  'ethereum',
  'ropsten',
  'heco',
  'polygon',
  ...knownDVMNetworks,
];
