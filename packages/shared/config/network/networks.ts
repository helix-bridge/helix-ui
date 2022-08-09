import { DVMNetwork, EthereumTypeNetwork, PolkadotTypeNetwork } from '../../model';
import { arbitrumConfig } from './arbitrum';
import { astarConfig } from './astar';
import { avalancheConfig } from './avalanche';
import { bnbChainConfig } from './bnb';
import { crabConfig } from './crab';
import { crabDVMConfig } from './crab-dvm';
import { crabParachainConfig } from './crab-parachain';
import { darwiniaConfig } from './darwinia';
import { darwiniaDVMConfig } from './darwinia-dvm';
import { ethereumConfig } from './ethereum';
import { hecoConfig } from './heco';
import { optimismConfig } from './optimism';
import { pangolinConfig } from './pangolin';
import { pangolinDVMConfig } from './pangolin-dvm';
import { pangolinParachainConfig } from './pangolin-parachain';
import { pangoroConfig } from './pangoro';
import { pangoroDVMConfig } from './pangoro-dvm';
import { polygonConfig } from './polygon';
import { ropstenConfig } from './ropsten';

export const SYSTEM_ChAIN_CONFIGURATIONS = [
  arbitrumConfig,
  astarConfig,
  avalancheConfig,
  bnbChainConfig,
  crabConfig,
  crabDVMConfig,
  crabParachainConfig,
  darwiniaConfig,
  darwiniaDVMConfig,
  ethereumConfig,
  hecoConfig,
  optimismConfig,
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
  'arbitrum',
  'astar',
  'avalanche',
  'BNB Chain',
  'optimism',
  ...knownDVMNetworks,
];
