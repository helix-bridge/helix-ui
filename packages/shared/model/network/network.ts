export type ParachainNetwork = 'pangolin-parachain' | 'karura' | 'crab-parachain' | 'moonriver';

export type PolkadotTypeNetwork =
  | 'pangolin'
  | 'crab'
  | 'darwinia'
  | 'pangoro'
  | 'polkadot'
  | Exclude<ParachainNetwork, 'moonriver'>;

export type DVMNetwork = 'pangolin-dvm' | 'crab-dvm' | 'pangoro-dvm' | 'darwinia-dvm';

export type ParachainEthereumCompatibleNetwork = 'moonriver';

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
  | ParachainEthereumCompatibleNetwork
  | DVMNetwork;

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | DVMNetwork | ParachainNetwork;

export type SupportedWallet = 'metamask' | 'polkadot';
