import type { ApiPromise } from '@polkadot/api';
import type { Injected, InjectedAccount, InjectedWindowProvider } from '@polkadot/extension-inject/types';
import once from 'lodash/once';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import type { Observable } from 'rxjs/internal/Observable';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { from } from 'rxjs/internal/observable/from';
import { concatMap } from 'rxjs/internal/operators/concatMap';
import { distinctUntilKeyChanged } from 'rxjs/internal/operators/distinctUntilKeyChanged';
import { map } from 'rxjs/internal/operators/map';
import { startWith } from 'rxjs/internal/operators/startWith';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
  ConnectionStatus,
  PolkadotChainConfig,
  PolkadotChainSimpleToken,
  PolkadotConnection,
  PolkadotExtension,
  SupportedWallet,
} from '../../model';
import { entrance } from './entrance';

const walletToPropName: { [key in PolkadotExtension | 'mathwallet']: string } = {
  polkadot: 'polkadot-js',
  subwallet: 'subwallet-js',
  talisman: 'talisman',
  mathwallet: 'mathwallet',
  'mathwallet-polkadot': 'mathwallet',
};

export const polkadotExtensions: PolkadotExtension[] = ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'];

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

export function getPolkadotExtension(wallet: PolkadotExtension): InjectedWindowProvider {
  return window.injectedWeb3[walletToPropName[wallet]];
}

export function isPolkadotExtensionInstalled(wallet: SupportedWallet): boolean {
  const ext = getPolkadotExtension(wallet as PolkadotExtension);

  return !!ext;
}

export const getPolkadotExtensionConnection: (
  network: PolkadotChainConfig,
  wallet: PolkadotExtension
) => Observable<PolkadotConnection> = (network, wallet) => {
  const provider = getPolkadotExtension(wallet);

  const extensionObs = from(provider.enable('helix')).pipe(
    concatMap((injected: Injected) =>
      from(injected.accounts.get()).pipe(
        map(
          (accounts: InjectedAccount[]) =>
            ({
              accounts: accounts.map((acc) => ({
                address: acc.address,
                type: acc.type,
                meta: { name: acc.name, genesisHash: acc.genesisHash, source: wallet },
              })),
              wallet,
              status: 'pending',
              chainId: network.name,
            } as Exclude<PolkadotConnection, 'api'>)
        )
      )
    ),
    startWith<PolkadotConnection>({
      status: ConnectionStatus.connecting,
      accounts: [],
      api: null,
      wallet: 'polkadot',
      chainId: network.name,
    })
  );

  const apiInstance = entrance.polkadot.getInstance(network.provider.wss);
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
