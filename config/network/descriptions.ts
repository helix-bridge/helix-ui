export const DESCRIPTIONS: {
  path: string[];
  editable: boolean;
  comment: string;
  type?: 'string' | 'boolean' | 'number' | 'array';
}[] = [
  // { path: ['api'], editable: true, comment: 'Index service endpoints' },
  // {
  //   path: ['api', 'dapp'],
  //   editable: true,
  //   comment: 'Endpoint of proof after registering Erc20 Token',
  //   type: 'string',
  // },
  // { path: ['api', 'evolution'], editable: true, comment: 'Deposit querying endpoint', type: 'string' },
  // { path: ['api', 'subGraph'], editable: true, comment: 'The graph endpoint', type: 'string' },
  // { path: ['api', 'subql'], editable: true, comment: 'Subql endpoint', type: 'string' },
  // { path: ['api', 'subscan'], editable: true, comment: 'Airdrop endpoint', type: 'string' },
  // { path: ['api', 'subqlMMr'], editable: true, comment: 'MMR endpoint deployed on subql', type: 'string' },

  // { path: ['contracts'], editable: true, comment: 'Contracts address in DVM or Ethereum' },
  // { path: ['contracts', 'fee'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'ring'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'kton'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'issuing'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'redeem'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'redeemDeposit'], editable: true, comment: '', type: 'string' },
  // { path: ['contracts', 'proof'], editable: true, comment: '', type: 'string' },

  { path: ['facade'], editable: true, comment: 'Appearance of the application' },
  { path: ['facade', 'logo'], editable: true, comment: '', type: 'string' },
  { path: ['facade', 'logoMinor'], editable: true, comment: '', type: 'string' },
  { path: ['facade', 'logoWithText'], editable: true, comment: '', type: 'string' },

  {
    path: ['isTest'],
    editable: false,
    comment: 'Identifies whether the current network is a test network',
    type: 'boolean',
  },

  // { path: ['lockEvents'], editable: true, comment: '', type: 'array' },
  // { path: ['lockEvents', 'key'], editable: true, comment: '', type: 'string' },
  // { path: ['lockEvents', 'max'], editable: true, comment: '', type: 'number' },
  // { path: ['lockEvents', 'min'], editable: true, comment: '', type: 'number' },

  { path: ['name'], editable: false, comment: '', type: 'string' },

  { path: ['provider'], editable: true, comment: 'RPC providers' },
  { path: ['provider', 'etherscan'], editable: true, comment: 'RPC provider in DVM or Ethereum', type: 'string' },
  { path: ['provider', 'rpc'], editable: true, comment: 'RPC provider in Substrate', type: 'string' },

  { path: ['ss58Prefix'], editable: false, comment: '', type: 'number' },

  { path: ['type'], editable: true, comment: 'The network types', type: 'array' },

  { path: ['dvm'], editable: true, comment: 'Network related information in DVM' },
  { path: ['dvm', 'kton'], editable: true, comment: '', type: 'string' },
  { path: ['dvm', 'ring'], editable: true, comment: '', type: 'string' },

  { path: ['ethereumChain'], editable: true, comment: 'Ethereum related information' },
  { path: ['ethereumChain', 'blockExplorerUrls'], editable: true, comment: '', type: 'array' },
  { path: ['ethereumChain', 'chainId'], editable: false, comment: '', type: 'string' },
  { path: ['ethereumChain', 'chainName'], editable: true, comment: '', type: 'string' },
  { path: ['ethereumChain', 'nativeCurrency', 'decimals'], editable: false, comment: '', type: 'number' },
  { path: ['ethereumChain', 'nativeCurrency', 'symbol'], editable: false, comment: '', type: 'string' },
  { path: ['ethereumChain', 'rpcUrls'], editable: true, comment: '', type: 'array' },
];
