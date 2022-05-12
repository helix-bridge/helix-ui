export type PolkadotTypeNetwork = 'pangolin' | 'crab' | 'darwinia' | 'pangoro' | 'polkadot';

export type EthereumTypeNetwork = 'ethereum' | 'ropsten' | 'polygon' | 'heco';

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork;

export type NetworkMode = 'native' | 'dvm';

export type SupportedWallet = 'metamask' | 'polkadot';
