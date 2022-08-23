export type ParachainNetwork = 'pangolin-parachain' | 'karura' | 'crab-parachain';

export type PolkadotTypeNetwork = 'pangolin' | 'crab' | 'darwinia' | 'pangoro' | 'polkadot' | ParachainNetwork;

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

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | DVMNetwork | ParachainNetwork;

export type SupportedWallet = 'metamask' | 'polkadot';
