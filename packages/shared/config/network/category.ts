import { Vertices } from '../../model';

export const knownPolkadotNetworks: Vertices[] = [
  { name: 'crab', mode: 'native' },
  { name: 'darwinia', mode: 'native' },
  { name: 'pangolin', mode: 'native' },
  { name: 'pangoro', mode: 'native' },
  { name: 'polkadot', mode: 'native' },
];

export const knownDarwiniaNetworks: Vertices[] = knownPolkadotNetworks.filter((item) => item.name !== 'polkadot');

export const knownDarwiniaDVMNetworks: Vertices[] = knownDarwiniaNetworks
  .filter((item) => item.name === 'pangolin' || item.name === 'crab')
  .map((item) => ({ ...item, mode: 'dvm' } as Vertices));

export const knownEthereumNetworks: Vertices[] = [
  { name: 'ethereum', mode: 'native' },
  { name: 'ropsten', mode: 'native' },
  { name: 'heco', mode: 'native' },
  { name: 'polygon', mode: 'native' },
  ...knownDarwiniaDVMNetworks.map((item) => ({ ...item, mode: 'dvm' } as Vertices)),
];
