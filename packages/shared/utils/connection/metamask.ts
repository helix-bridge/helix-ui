import type { DebouncedFunc } from 'lodash';
import throttle from 'lodash/throttle';
import { Observable } from 'rxjs/internal/Observable';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { from } from 'rxjs/internal/observable/from';
import { merge } from 'rxjs/internal/observable/merge';
import { of } from 'rxjs/internal/observable/of';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { startWith } from 'rxjs/internal/operators/startWith';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import type { Observer } from 'rxjs/internal/types';
import { SHORT_DURATION } from '../../config/constant';
import {
  ConnectionStatus,
  EthereumChainConfig,
  EthereumConnection,
  MetamaskNativeNetworkIds,
  TokenWithBridgesInfo,
} from '../../model';
import { readStorage, updateStorage } from '../helper/storage';

export function isNativeMetamaskChain(chain: EthereumChainConfig): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];

  return ids.includes(parseInt(chain.ethereumChain.chainId, 16));
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
  try {
    const res: null = await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.ethereumChain.chainId }],
    });

    return res;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (switchError: any) {
    // eslint-disable-next-line no-magic-numbers
    if (switchError.code === 4902) {
      return addEthereumChain(chain);
    } else {
      throw switchError;
    }
  }
}

/**
 * @description add chain in metamask
 */
async function addEthereumChain(chain: EthereumChainConfig): Promise<null> {
  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [chain.ethereumChain],
  });

  return result;
}

export const switchMetamaskNetwork: DebouncedFunc<(chain: EthereumChainConfig) => Observable<null>> = throttle(
  (chain) => {
    return new Observable((observer: Observer<null>) => {
      switchEthereumChain(chain)
        .then((res) => {
          const origin = readStorage().activeWallet ?? {};

          updateStorage({ activeWallet: { ...origin, chain: chain.name } });
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
