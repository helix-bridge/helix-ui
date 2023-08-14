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
import { crabDVMConfig } from './crab-dvm';
import { crabParachainConfig } from './crab-parachain';
import { darwiniaConfig } from './darwinia';
import { darwiniaDVMConfig } from './darwinia-dvm';
import { ethereumConfig } from './ethereum';
import { goerliConfig } from './goerli';
import { arbitrumGoerliConfig } from './arbitrum-goerli';
import { hecoConfig } from './heco';
import { karuraConfig } from './karura';
import { khalaConfig } from './khala';
import { moonriverConfig } from './moonriver';
import { optimismConfig } from './optimism';
import { pangolinDVMConfig } from './pangolin-dvm';
import { pangoroDVMConfig } from './pangoro-dvm';
import { polygonConfig } from './polygon';
import { ropstenConfig } from './ropsten';
import { shidenConfig } from './shiden';
import { zksyncGoerliConfig } from './zksync-goerli';

export const SYSTEM_CHAIN_CONFIGURATIONS: (EthereumChainConfig | PolkadotChainConfig | ParachainChainConfig)[] = [
  arbitrumConfig,
  astarConfig,
  avalancheConfig,
  bscConfig,
  crabDVMConfig,
  crabParachainConfig,
  darwiniaConfig,
  darwiniaDVMConfig,
  ethereumConfig,
  goerliConfig,
  arbitrumGoerliConfig,
  hecoConfig,
  karuraConfig,
  khalaConfig,
  moonriverConfig,
  optimismConfig,
  pangolinDVMConfig,
  pangoroDVMConfig,
  polygonConfig,
  ropstenConfig,
  shidenConfig,
  zksyncGoerliConfig,
];

export const knownParachainNetworks: ParachainNetwork[] = ['crab-parachain', 'karura', 'khala', 'moonriver', 'shiden'];

export const knownPolkadotNetworks: PolkadotTypeNetwork[] = [
  'crab',
  'darwinia',
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
  'arbitrum-goerli',
  'astar',
  'avalanche',
  'bsc',
  'optimism',
  'zksync-goerli',
  ...knownDVMNetworks,
  ...knownParachainEthereumCompatibleNetworks,
];
