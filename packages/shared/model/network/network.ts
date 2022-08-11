export type PolkadotTypeNetwork =
  | 'pangolin'
  | 'crab'
  | 'darwinia'
  | 'pangoro'
  | 'polkadot'
  | 'pangolin-parachain'
  | 'crab-parachain';

export type DVMNetwork = 'pangolin-dvm' | 'crab-dvm' | 'pangoro-dvm' | 'darwinia-dvm';

export type EthereumTypeNetwork =
  | 'ethereum'
  | 'ropsten'
  | 'polygon'
  | 'heco'
  | 'bsc'
  | 'avalanche'
  | 'arbitrum'
  | 'optimism'
  | 'astar'
  | DVMNetwork;

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | DVMNetwork;

export type SupportedWallet = 'metamask' | 'polkadot';
