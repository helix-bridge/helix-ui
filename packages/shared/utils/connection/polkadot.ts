import { ApiPromise } from '@polkadot/api';
import once from 'lodash/once';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  distinctUntilKeyChanged,
  from,
  map,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import { ConnectionStatus, PolkadotChainConfig, PolkadotChainSimpleToken, PolkadotConnection } from '../../model';
import { entrance } from './entrance';

export async function waitUntilConnected(api: ApiPromise): Promise<null> {
  await api.isReady;

  return new Promise((resolve) => {
    if (!api.isConnected) {
      api.on(
        'connected',
        once(() => resolve(null))
      );
    } else {
      resolve(null);
    }
  });
}

export async function getPolkadotChainProperties(api: ApiPromise): Promise<PolkadotChainSimpleToken> {
  const chainState = await api?.rpc.system.properties();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { tokenDecimals, tokenSymbol, ss58Format } = chainState?.toHuman() as any;

  return tokenDecimals.reduce(
    (acc: PolkadotChainSimpleToken, decimal: string, index: number) => {
      const token = { decimals: +decimal, symbol: tokenSymbol[index] };

      return { ...acc, tokens: [...acc.tokens, token] };
    },
    { ss58Format, tokens: [] }
  );
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
                  chainId: network.name,
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
      chainId: network.name,
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
