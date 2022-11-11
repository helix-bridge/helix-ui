import { isHex } from '@polkadot/util';
import { initReactI18next } from 'react-i18next';
import { Modal } from 'antd';
import { Trans, i18n } from 'next-i18next';
import type { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
  ChainConfig,
  Connection,
  EthereumChainConfig,
  EthereumConnection,
  PolkadotChainConfig,
  PolkadotConnection,
  SupportedWallet,
} from '../../model';
import { entrance } from './entrance';
import { getMetamaskConnection, isMetamaskInstalled, switchMetamaskNetwork } from './metamask';
import { getPolkadotExtensionConnection, isPolkadotExtensionInstalled, PolkadotExtension } from './polkadot';

type ConnectFn<T extends Connection> = (network: ChainConfig, extension?: SupportedWallet) => Observable<T>;

const showWarning = (plugin: string, downloadUrl: string) =>
  Modal.warn({
    title: <Trans i18n={i18n?.use(initReactI18next)}>Missing Wallet Plugin</Trans>,
    content: (
      <Trans i18nKey="MissingPlugin" i18n={i18n?.use(initReactI18next)}>
        We need {{ plugin }} plugin to continue. Please
        <a href={downloadUrl} target="_blank" rel="noreferrer" style={{ margin: '0 0.5em' }}>
          install
        </a>
        or enable it first.
      </Trans>
    ),
    okText: <Trans i18n={i18n?.use(initReactI18next)}>OK</Trans>,
  });

const connectPolkadot: ConnectFn<PolkadotConnection> = (network, wallet = 'polkadot') => {
  if (!network) {
    return EMPTY;
  }

  return from(isPolkadotExtensionInstalled(wallet)).pipe(
    switchMap((enable) => {
      if (enable) {
        return getPolkadotExtensionConnection(network as PolkadotChainConfig, wallet as PolkadotExtension);
      } else {
        showWarning('polkadot', 'https://polkadot.js.org/extension/');
        return EMPTY;
      }
    })
  );
};

export async function isNetworkConsistent(chain: EthereumChainConfig, id = ''): Promise<boolean> {
  id = id && isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const web3 = entrance.web3.currentProvider;
  const actualId: string | number = id ? await Promise.resolve(id) : await web3.getNetwork().then((res) => res.chainId);
  const storedId = chain.ethereumChain.chainId;

  return parseInt(storedId, 16) === actualId;
}

export function metamaskGuard<T>(fn: () => Observable<T>) {
  return (network: ChainConfig, chainId?: string) => {
    if (!isMetamaskInstalled()) {
      showWarning(
        'metamask',
        'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN'
      );

      return EMPTY;
    }

    return from(isNetworkConsistent(network as EthereumChainConfig, chainId)).pipe(
      switchMap((isMatch) => {
        return isMatch
          ? fn()
          : switchMetamaskNetwork(network as EthereumChainConfig)!.pipe(
              mergeMap((res) => (res === null ? fn() : EMPTY))
            );
      })
    );
  };
}

export const isMetamaskChainConsistent = metamaskGuard(() => of(true));

const connectMetamask: ConnectFn<EthereumConnection> = metamaskGuard(getMetamaskConnection);

const walletConnections: {
  [key in SupportedWallet]: ConnectFn<Connection>;
} = {
  metamask: connectMetamask,
  polkadot: connectPolkadot,
  subwallet: connectPolkadot,
  talisman: connectPolkadot,
  mathwallet: connectPolkadot,
};

export const connect: ConnectFn<Connection> = (chain, wallet) => {
  const { wallets } = chain;

  if (wallet && !wallets.includes(wallet)) {
    console.log(`🚨 ~${chain.name} do not support wallet: `, wallet);
    return EMPTY;
  }

  return walletConnections[wallet ?? chain.wallets[0]](chain, wallet);
};
