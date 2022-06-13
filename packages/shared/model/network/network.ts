export type PolkadotTypeNetwork =
  | 'pangolin'
  | 'crab'
  | 'darwinia'
  | 'pangoro'
  | 'polkadot'
  | 'pangolin-parachain'
  | 'crab-parachain';

export type EthereumTypeNetwork = 'ethereum' | 'ropsten' | 'polygon' | 'heco';

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork;

export type NetworkMode = 'native' | 'dvm';

export type SupportedWallet = 'metamask' | 'polkadot';
