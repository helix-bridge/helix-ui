import { isHex } from '@polkadot/util';
import { Modal } from 'antd';
import { i18n, Trans } from 'next-i18next';
import { ReactNode } from 'react';
import { initReactI18next } from 'react-i18next';
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
import { isEthereumNetwork, isPolkadotNetwork } from '../network/network';
import { entrance } from './entrance';
import {
  EthereumExtension,
  ethereumExtensions,
  getMetamaskConnection,
  isEthereumExtensionInstalled,
  switchMetamaskNetwork,
} from './metamask';
import {
  getPolkadotExtensionConnection,
  isPolkadotExtensionInstalled,
  PolkadotExtension,
  polkadotExtensions,
} from './polkadot';

type ConnectFn<T extends Connection> = (network: ChainConfig, extension: SupportedWallet) => Observable<T>;

const showWarning = (plugin: string, downloadUrl: string, extra?: string | ReactNode) =>
  Modal.warn({
    title: <Trans i18n={i18n?.use(initReactI18next)}>Wallet Not Available</Trans>,
    content: (
      <div>
        <Trans i18nKey="MissingPlugin" i18n={i18n?.use(initReactI18next)}>
          Please
          <a href={downloadUrl} target="_blank" rel="noreferrer">
            install
          </a>
          {{ plugin }}
          or enable it first.
        </Trans>

        <p>{extra}</p>
      </div>
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
        const url: { [key in PolkadotExtension]: string } = {
          polkadot: 'https://polkadot.js.org/extension/',
          subwallet: 'https://subwallet.app/',
          talisman: 'https://talisman.xyz/',
          mathwallet: 'https://mathwallet.org/',
        };
        const extraTip = wallet === 'mathwallet' ? 'Make sure you have switch to a Polkadot-Type chain' : undefined;

        showWarning(wallet, url[wallet as PolkadotExtension], extraTip);
        return EMPTY;
      }
    })
  );
};

async function isNetworkConsistent(chain: EthereumChainConfig, id = ''): Promise<boolean> {
  id = id && isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const web3 = entrance.web3.currentProvider;
  // TODO: on mathwallet it will be 0 if no account.
  const actualId: string | number = id ? await Promise.resolve(id) : await web3.getNetwork().then((res) => res.chainId);
  const storedId = chain.ethereumChain.chainId;

  return parseInt(storedId, 16) === actualId;
}

export function metamaskGuard<T>(fn: (wallet: EthereumExtension) => Observable<T>) {
  return (network: ChainConfig, wallet: SupportedWallet) => {
    if (!isEthereumExtensionInstalled(wallet as EthereumExtension)) {
      const url: { [key in EthereumExtension]: string } = {
        metamask: 'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN',
        mathwallet: 'https://mathwallet.org/',
      };
      const extraTip = wallet === 'mathwallet' ? 'Make sure you have switch to a Ethereum-Type chain' : undefined;

      showWarning(wallet, url[wallet as EthereumExtension], extraTip);

      return EMPTY;
    }

    return from(isNetworkConsistent(network as EthereumChainConfig)).pipe(
      switchMap((isMatch) => {
        return isMatch
          ? fn(wallet as EthereumExtension)
          : switchMetamaskNetwork(network as EthereumChainConfig)!.pipe(
              mergeMap((isSuccess) => (isSuccess ? fn(wallet as EthereumExtension) : EMPTY))
            );
      })
    );
  };
}

export const isMetamaskChainConsistent = metamaskGuard(() => of(true));

const connectMetamask: ConnectFn<EthereumConnection> = metamaskGuard(getMetamaskConnection);

// eslint-disable-next-line complexity
export const connect: ConnectFn<Connection> = (chain, wallet) => {
  const { wallets } = chain;

  if (wallet && !wallets.includes(wallet)) {
    console.log(`🚨 ~${chain.name} do not support wallet: `, wallet);
    return EMPTY;
  }

  const extension = wallet ?? chain.wallets[0];

  if (polkadotExtensions.includes(extension as unknown as never) && isPolkadotNetwork(chain)) {
    return connectPolkadot(chain, extension);
  } else if (ethereumExtensions.includes(extension as unknown as never) && isEthereumNetwork(chain)) {
    return connectMetamask(chain, extension);
  } else {
    console.log(`🚨 ~${chain.name} do not support wallet: `, wallet);
    return EMPTY;
  }
};
