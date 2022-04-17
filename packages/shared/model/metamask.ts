/* eslint-disable no-magic-numbers */
export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string when add or switch chain; Save in decimal in other situation.
  chainName: string;
  nativeCurrency: {
    name?: string;
    symbol?: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export interface MetamaskError {
  code: number;
  data: Record<string, unknown>;
  message: string;
}

export enum MetamaskNativeNetworkIds {
  ethereum = 1,
  ropsten = 3,
  rinkeby = 4,
  goerli = 5,
  kovan = 42,
}
