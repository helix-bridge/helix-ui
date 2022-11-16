import type { DebouncedFunc } from 'lodash';
import throttle from 'lodash/throttle';
import { notification } from 'antd';
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
  EthereumExtension,
  MetamaskNativeNetworkIds,
  TokenWithBridgesInfo,
} from '../../model';
import { readStorage, updateStorage } from '../helper/storage';

export const ethereumExtensions: EthereumExtension[] = ['metamask', 'mathwallet-ethereum'];

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

export const getMetamaskConnection: (wallet: EthereumExtension) => Observable<EthereumConnection> = (wallet) =>
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
          wallet,
        }))
      );

      const obs = new Observable((observer: Observer<EthereumConnection>) => {
        window.ethereum.on('accountsChanged', (accounts: string[]) =>
          from<string>(window.ethereum.request({ method: 'eth_chainId' })).subscribe((chainId) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              wallet,
              chainId,
            });
          })
        );
        window.ethereum.on('chainChanged', (chainId: string) => {
          from<string[][]>(window.ethereum.request({ method: 'eth_accounts' })).subscribe((accounts) => {
            observer.next({
              status: ConnectionStatus.success,
              accounts: addressToAccounts(accounts),
              wallet,
              chainId,
            });
          });
        });
      });

      return merge(request, obs);
    }),
    catchError((_) => {
      return of<EthereumConnection>({ status: ConnectionStatus.error, accounts: [], wallet: 'metamask', chainId: '' });
    }),
    startWith<EthereumConnection>({
      status: ConnectionStatus.connecting,
      accounts: [],
      wallet,
      chainId: '',
    })
  );

// eslint-disable-next-line complexity
export async function switchEthereumChain(chain: EthereumChainConfig): Promise<boolean> {
  try {
    const res = await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.ethereumChain.chainId }],
    });

    return res === null || !!res; // switch success:  metamask return null; mathwallet return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (switchError: any) {
    const metamaskErrCode = 4902;
    if (window.ethereum.isMathWallet) {
      notification.warn({
        message: `Switch Error`,
        description: `Please add ${chain.name} on mathwallet and enable it`,
      });

      throw switchError;
    } else if (switchError.code === metamaskErrCode) {
      const added = await addEthereumChain(chain);

      if (added === null) {
        return switchEthereumChain(chain);
      } else {
        throw switchError;
      }
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

export const switchMetamaskNetwork: DebouncedFunc<(chain: EthereumChainConfig) => Observable<boolean>> = throttle(
  (chain) => {
    return new Observable((observer: Observer<boolean>) => {
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

export function isEthereumExtensionInstalled(ext: EthereumExtension): boolean {
  switch (ext) {
    case 'mathwallet-ethereum':
      return window.ethereum?.isMathWallet;
    case 'metamask':
      return window.ethereum?.isMetaMask;
    default:
      return false;
  }
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
