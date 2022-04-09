export type PolkadotTypeNetwork = 'pangolin' | 'crab' | 'darwinia' | 'pangoro';

export type EthereumTypeNetwork = 'ethereum' | 'ropsten';

type TronTypeNetwork = 'tron';

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | TronTypeNetwork;

export type NetworkCategory = 'polkadot' | 'ethereum' | 'darwinia' | 'dvm' | 'tron';

export type NetworkMode = 'native' | 'dvm';
