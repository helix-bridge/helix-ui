import {
  DVMNetwork,
  EthereumChainConfig,
  EthereumTypeNetwork,
  ParachainChainConfig,
  ParachainEthereumCompatibleNetwork,
  ParachainNetwork,
  PolkadotChainConfig,
  PolkadotTypeNetwork,
} from '../../model';
import { arbitrumConfig } from './arbitrum';
import { astarConfig } from './astar';
import { avalancheConfig } from './avalanche';
import { bscConfig } from './bsc';
import { crabConfig } from './crab';
import { crabDVMConfig } from './crab-dvm';
import { crabParachainConfig } from './crab-parachain';
import { darwiniaConfig } from './darwinia';
import { darwiniaDVMConfig } from './darwinia-dvm';
import { ethereumConfig } from './ethereum';
import { goerliConfig } from './goerli';
import { hecoConfig } from './heco';
import { karuraConfig } from './karura';
import { khalaConfig } from './khala';
import { moonriverConfig } from './moonriver';
import { optimismConfig } from './optimism';
import { pangolinConfig } from './pangolin';
import { pangolinDVMConfig } from './pangolin-dvm';
import { pangolinParachainConfig } from './pangolin-parachain';
import { pangoroConfig } from './pangoro';
import { pangoroDVMConfig } from './pangoro-dvm';
import { polygonConfig } from './polygon';
import { ropstenConfig } from './ropsten';
import { shidenConfig } from './shiden';

export const SYSTEM_CHAIN_CONFIGURATIONS: (EthereumChainConfig | PolkadotChainConfig | ParachainChainConfig)[] = [
  arbitrumConfig,
  astarConfig,
  avalancheConfig,
  bscConfig,
  crabConfig,
  crabDVMConfig,
  crabParachainConfig,
  darwiniaConfig,
  darwiniaDVMConfig,
  ethereumConfig,
  goerliConfig,
  hecoConfig,
  karuraConfig,
  khalaConfig,
  moonriverConfig,
  optimismConfig,
  pangolinConfig,
  pangolinDVMConfig,
  pangolinParachainConfig,
  pangoroConfig,
  pangoroDVMConfig,
  polygonConfig,
  ropstenConfig,
  shidenConfig,
];

export const knownParachainNetworks: ParachainNetwork[] = [
  'pangolin-parachain',
  'crab-parachain',
  'karura',
  'khala',
  'moonriver',
  'shiden',
];

export const knownPolkadotNetworks: PolkadotTypeNetwork[] = [
  'crab',
  'darwinia',
  'pangolin',
  'pangoro',
  'polkadot',
  ...(knownParachainNetworks.filter((item) => item !== 'moonriver') as PolkadotTypeNetwork[]),
];

export const knownDVMNetworks: DVMNetwork[] = ['crab-dvm', 'pangolin-dvm', 'pangoro-dvm', 'darwinia-dvm'];

export const knownParachainEthereumCompatibleNetworks: ParachainEthereumCompatibleNetwork[] = ['moonriver'];

export const knownEthereumNetworks: (DVMNetwork | EthereumTypeNetwork)[] = [
  'ethereum',
  'ropsten',
  'goerli',
  'heco',
  'polygon',
  'arbitrum',
  'astar',
  'avalanche',
  'bsc',
  'optimism',
  ...knownDVMNetworks,
  ...knownParachainEthereumCompatibleNetworks,
];
