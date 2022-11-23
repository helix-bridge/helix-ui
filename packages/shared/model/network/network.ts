export type ParachainNetwork = 'pangolin-parachain' | 'karura' | 'crab-parachain' | 'moonriver' | 'shiden' | 'khala';

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
  | 'goerli'
  | ParachainEthereumCompatibleNetwork
  | DVMNetwork;

export type Network = PolkadotTypeNetwork | EthereumTypeNetwork | DVMNetwork | ParachainNetwork;

export type SupportedWallet =
  | 'metamask'
  | 'polkadot'
  | 'talisman'
  | 'subwallet'
  | 'mathwallet-ethereum'
  | 'mathwallet-polkadot';

export type EthereumExtension = Extract<SupportedWallet, 'metamask' | 'mathwallet-ethereum'>;

export type PolkadotExtension = Exclude<SupportedWallet, 'metamask' | 'mathwallet-ethereum'>;
