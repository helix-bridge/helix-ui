import { ApiPromise } from '@polkadot/api';
import { Modal } from 'antd';
import Link from 'antd/lib/typography/Link';
import { Trans } from 'react-i18next';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  concatMap,
  distinctUntilKeyChanged,
  EMPTY,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  Observer,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import {
  ChainConfig,
  Connection,
  ConnectionStatus,
  EthereumChainConfig,
  EthereumConnection,
  NetworkCategory,
  PolkadotChainConfig,
  PolkadotConnection,
  TronConnection,
} from '../../model';
import { isMetamaskInstalled, isNetworkConsistent, isTronLinkReady } from '../network';
import { entrance } from './entrance';
import { waitUntilConnected } from './polkadot';
import { switchMetamaskNetwork } from './switch';

type ConnectFn<T extends Connection> = (network: ChainConfig, chainId?: string) => Observable<T>;

type ConnectConfig = {
  [key in NetworkCategory]: ConnectFn<Connection>;
};

interface TronAddress {
  base58: string;
  hex: string;
  name?: string;
}

export const getPolkadotConnection: (network: PolkadotChainConfig) => Observable<PolkadotConnection> = (network) => {
  const bundle = import('@polkadot/extension-dapp').then(({ web3Enable, web3Accounts }) => ({
    web3Enable,
    web3Accounts,
  }));

  const extensionObs = from(bundle).pipe(
    concatMap(({ web3Accounts, web3Enable }) =>
      from(web3Enable('polkadot-js/apps')).pipe(
        concatMap((extensions) =>
          from(web3Accounts()).pipe(
            map(
              (accounts) =>
                ({
                  accounts: !extensions.length && !accounts.length ? [] : accounts,
                  type: 'polkadot',
                  status: 'pending',
                  network: network.name,
                } as Exclude<PolkadotConnection, 'api'>)
            )
          )
        )
      )
    ),
    startWith<PolkadotConnection>({
      status: ConnectionStatus.connecting,
      accounts: [],
      api: null,
      type: 'polkadot',
      network: network.name,
    })
  );

  const apiInstance = entrance.polkadot.getInstance(network.provider);
  const apiObs = from(waitUntilConnected(apiInstance)).pipe(map(() => apiInstance));

  return combineLatest([extensionObs, apiObs]).pipe(
    switchMap(([envelop, api]: [Exclude<PolkadotConnection, 'api'>, ApiPromise]) => {
      const subject = new BehaviorSubject<PolkadotConnection>(envelop);

      api.on('connected', () => {
        subject.next({ ...envelop, status: ConnectionStatus.success, api });
      });

      api.on('disconnected', () => {
        subject.next({ ...envelop, status: ConnectionStatus.connecting, api });
      });

      api.on('error', (_) => {
        subject.next({ ...envelop, status: ConnectionStatus.error, api });
      });

      subject.next({ ...envelop, status: ConnectionStatus.success, api });

      return subject.asObservable().pipe(distinctUntilKeyChanged('status'));
    })
  );
};

export const getEthereumConnection: () => Observable<EthereumConnection> = () =>
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

export const getTronConnection: () => Observable<TronConnection> = () => {
  const wallet = window.tronWeb.defaultAddress;

  const mapData: (data: TronAddress) => TronConnection = (data) => ({
    status: ConnectionStatus.success,
    accounts: [{ address: data.base58, meta: { name: data?.name ?? '', source: '', genesisHash: '' } }],
    type: 'tron',
  });

  const obs: Observable<TronConnection> = new Observable((observer) => {
    window.tronWeb.on('addressChanged', (data: TronAddress) => {
      observer.next(mapData(data));
    });
  });

  return obs.pipe(startWith<TronConnection>(mapData(wallet)));
};

const showWarning = (plugin: string, downloadUrl: string) =>
  Modal.warn({
    title: <Trans>Missing Wallet Plugin</Trans>,
    content: (
      <Trans i18nKey="MissingPlugin">
        We need {{ plugin }} plugin to continue. Please
        <Link href={downloadUrl} target="_blank">
          install
        </Link>
        or <Link>enable</Link> it first.
      </Trans>
    ),
    okText: <Trans>OK</Trans>,
  });

const connectToPolkadot: ConnectFn<PolkadotConnection> = (network) =>
  !network ? EMPTY : getPolkadotConnection(network as PolkadotChainConfig);

const connectToEthereum: ConnectFn<EthereumConnection> = (network, chainId?) => {
  if (!isMetamaskInstalled()) {
    showWarning(
      'metamask',
      'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN'
    );

    return EMPTY;
  }

  return from(isNetworkConsistent(network, chainId)).pipe(
    switchMap((isMatch) =>
      isMatch
        ? getEthereumConnection()
        : switchMetamaskNetwork(network as EthereumChainConfig)!.pipe(mergeMap(() => getEthereumConnection()))
    )
  );
};

const connectToTron = () => {
  return from(isTronLinkReady()).pipe(
    switchMap((isReady) => {
      if (!isReady) {
        showWarning(
          'tronLink',
          'https://chrome.google.com/webstore/detail/tronlink%EF%BC%88%E6%B3%A2%E5%AE%9D%E9%92%B1%E5%8C%85%EF%BC%89/ibnejdfjmmkpcnlpebklmnkoeoihofec'
        );
        return EMPTY;
      } else {
        return getTronConnection();
      }
    })
  );
};

const config: ConnectConfig = {
  darwinia: connectToPolkadot,
  dvm: connectToEthereum,
  ethereum: connectToEthereum,
  polkadot: connectToPolkadot,
  tron: connectToTron,
};

export const connect: ConnectFn<Connection> = (chain, chainId) => {
  const category = chain.category[0];

  if (category === null) {
    return EMPTY;
  }

  return config[category](chain, chainId);
};
