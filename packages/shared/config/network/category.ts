import { DVMNetwork, EthereumTypeNetwork, PolkadotTypeNetwork } from '../../model';

export const knownPolkadotNetworks: PolkadotTypeNetwork[] = [
  'crab',
  'darwinia',
  'pangolin',
  'pangoro',
  'polkadot',
  'pangolin-parachain',
  'crab-parachain',
];

export const knownDVMNetworks: DVMNetwork[] = ['crab-dvm', 'pangolin-dvm', 'pangoro-dvm'];

export const knownEthereumNetworks: (DVMNetwork | EthereumTypeNetwork)[] = [
  'ethereum',
  'ropsten',
  'heco',
  'polygon',
  ...knownDVMNetworks,
];
