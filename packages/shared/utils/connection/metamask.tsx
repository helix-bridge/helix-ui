import { Button, message, notification } from 'antd';
import { DebouncedFunc, throttle } from 'lodash';
import { i18n } from 'next-i18next';
import { initReactI18next, Trans } from 'react-i18next';
import { catchError, combineLatest, from, map, merge, Observable, Observer, of, startWith, switchMap } from 'rxjs';
import Web3 from 'web3';
import { SHORT_DURATION } from '../../config/constant';
import {
  ConnectionStatus,
  EthereumChainConfig,
  EthereumConnection,
  MetamaskError,
  MetamaskNativeNetworkIds,
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
    const key = `key${Date.now()}`;

    return new Observable((observer: Observer<null>) => {
      return notification.error({
        message: <Trans i18n={i18n?.use(initReactI18next)}>Incorrect network</Trans>,
        description: (
          <Trans i18n={i18n?.use(initReactI18next)}>
            Network mismatch, you can switch network manually in metamask or do it automatically by clicking the button
            below
          </Trans>
        ),
        btn: (
          <Button
            type="primary"
            onClick={async () => {
              try {
                const isNative = isNativeMetamaskChain(chain);
                const action = isNative ? switchEthereumChain : addEthereumChain;
                const res = await action(chain);

                notification.close(key);
                observer.next(res);
              } catch (err: unknown) {
                message.error({
                  content: (
                    <span>
                      <Trans i18n={i18n?.use(initReactI18next)}>
                        Network switch failed, please switch it in the metamask plugin!
                      </Trans>
                      <span className="ml-2">{(err as MetamaskError).message}</span>
                    </span>
                  ),
                  duration: 5,
                });
              }
            }}
          >
            <Trans
              i18nKey="Switch to {{ network }}"
              tOptions={{ network: chain.name }}
              i18n={i18n?.use(initReactI18next)}
            ></Trans>
          </Button>
        ),
        key,
        onClose: () => {
          notification.close(key);
          observer.complete();
        },
        duration: null,
      });
    });
  },
  SHORT_DURATION
);

export function isMetamaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined';
}
