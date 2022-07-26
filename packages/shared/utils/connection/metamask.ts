import { DebouncedFunc, throttle } from 'lodash';
import { catchError, combineLatest, from, map, merge, Observable, Observer, of, startWith, switchMap } from 'rxjs';
import Web3 from 'web3';
import { SHORT_DURATION } from '../../config/constant';
import {
  ConnectionStatus,
  EthereumChainConfig,
  EthereumConnection,
  MetamaskNativeNetworkIds,
  TokenWithBridgesInfo,
} from '../../model';

function isNativeMetamaskChain(chain: EthereumChainConfig): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];

  return ids.includes(+chain.ethereumChain.chainId);
}

export const getMetamaskConnection: () => Observable<EthereumConnection> = () =>
  from(window.ethereum.request({ method: 'eth_requestAccounts' })).pipe(
    switchMap((_) => {
      const addressToAccounts = (addresses: string[]) =>
        addresses.map((address) => ({ address, meta: { source: '' } }));

      const request: Observable<EthereumConnection> = combineLatest([
        from<string[][]>(window.ethereum.request({ method: 'eth_accounts' })),
        from<string>(window.ethereum.request({ method: 'eth_chainId' })),
      ]).pipe(
        map(([addresses, chainId]) => ({
          accounts: addressToAccounts(addresses),
          status: ConnectionStatus.success,
          chainId,
          type: 'metamask',
        }))
      );

      const obs = new Observable((observer: Observer<EthereumConnection>) => {
        window.ethereum.on('accountsChanged', (accounts: string[]) =>
          from<string>(window.ethereum.request({ method: 'eth_chainId' })).subscribe((chainId) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              type: 'metamask',
              chainId,
            });
          })
        );
        window.ethereum.on('chainChanged', (chainId: string) => {
          from<string[][]>(window.ethereum.request({ method: 'eth_accounts' })).subscribe((accounts) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              type: 'metamask',
              chainId,
            });
          });
        });
      });

      return merge(request, obs);
    }),
    catchError((_) => {
      return of<EthereumConnection>({ status: ConnectionStatus.error, accounts: [], type: 'metamask', chainId: '' });
    }),
    startWith<EthereumConnection>({ status: ConnectionStatus.connecting, accounts: [], type: 'metamask', chainId: '' })
  );

export async function switchEthereumChain(chain: EthereumChainConfig): Promise<null> {
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const res: null = await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });

  return res;
}

/**
 * @description add chain in metamask
 */
async function addEthereumChain(chain: EthereumChainConfig): Promise<null> {
  // TODO check the chaiId field, store in decimal in configuration but may be required hexadecimal in metamask side.
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...chain.ethereumChain, chainId }],
  });

  return result;
}

export const switchMetamaskNetwork: DebouncedFunc<(chain: EthereumChainConfig) => Observable<null>> = throttle(
  (chain) => {
    return new Observable((observer: Observer<null>) => {
      const isNative = isNativeMetamaskChain(chain);
      const action = isNative ? switchEthereumChain : addEthereumChain;

      action(chain)
        .then((res) => {
          observer.next(res);
        })
        .catch(() => {
          observer.error('Switch metamask chain failed');
        });
    });
  },
  SHORT_DURATION
);

export function isMetamaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined';
}

export async function addAsset(
  token: Pick<TokenWithBridgesInfo, 'decimals' | 'symbol' | 'address' | 'logo'>
): Promise<boolean> {
  const { address, symbol, decimals, logo } = token;

  const wasAdded: boolean = await window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20', // Initially only supports ERC20, but eventually more!
      options: {
        address,
        symbol,
        decimals,
        image: logo,
      },
    },
  });

  return wasAdded;
}
