import { isHex } from '@polkadot/util';
import { Modal, notification } from 'antd';
import { upperFirst } from 'lodash';
import { i18n, Trans } from 'next-i18next';
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
  EthereumExtension,
  PolkadotChainConfig,
  PolkadotConnection,
  PolkadotExtension,
  SupportedWallet,
} from '../../model';
import { isEthereumNetwork, isPolkadotNetwork } from '../network/network';
import { entrance } from './entrance';
import {
  ethereumExtensions,
  getMetamaskConnection,
  isEthereumExtensionInstalled,
  switchMetamaskNetwork,
} from './metamask';
import { getPolkadotExtensionConnection, isPolkadotExtensionInstalled, polkadotExtensions } from './polkadot';

type ConnectFn<T extends Connection> = (network: ChainConfig, extension: SupportedWallet) => Observable<T>;

export const extractWalletInfo = (wallet: SupportedWallet) =>
  wallet
    .split('-')
    .map(upperFirst)
    .map((item) => (item === 'Mathwallet' ? 'Math Wallet' : item));

const showWarning = (name: SupportedWallet, downloadUrl: string) => {
  const [plugin, mode] = extractWalletInfo(name);

  return Modal.warn({
    title: <Trans i18n={i18n?.use(initReactI18next)}>Wallet Not Available</Trans>,
    content: (
      <div>
        <p className="mb-2">
          <span>
            <Trans i18nKey="MissingPlugin" i18n={i18n?.use(initReactI18next)}>
              Make sure the {{ plugin }} plugin is installed and unlocked.
            </Trans>
          </span>
          {!!mode && (
            <span className="ml-2">
              <Trans i18nKey="MissingPluginType" i18n={i18n?.use(initReactI18next)}>
                And you need to switch to a {{ mode }}-Type chain in the wallet.
              </Trans>
            </span>
          )}
        </p>

        <a href={downloadUrl} target="_blank" rel="noreferrer">
          <Trans i18nKey="Install Now" i18n={i18n?.use(initReactI18next)}>
            Install Now
          </Trans>
        </a>
      </div>
    ),
    okText: <Trans i18n={i18n?.use(initReactI18next)}>OK</Trans>,
  });
};

const connectPolkadot: ConnectFn<PolkadotConnection> = (network, wallet = 'polkadot') => {
  if (!network) {
    return EMPTY;
  }

  return of(isPolkadotExtensionInstalled(wallet)).pipe(
    switchMap((enable) => {
      if (enable) {
        return getPolkadotExtensionConnection(network as PolkadotChainConfig, wallet as PolkadotExtension);
      } else {
        const url: { [key in PolkadotExtension]: string } = {
          polkadot: 'https://polkadot.js.org/extension/',
          subwallet: 'https://subwallet.app/',
          talisman: 'https://talisman.xyz/',
          'mathwallet-polkadot': 'https://mathwallet.org/',
        };

        showWarning(wallet, url[wallet as PolkadotExtension]);
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
  // eslint-disable-next-line complexity
  return (network: ChainConfig, wallet?: SupportedWallet) => {
    if (!wallet) {
      wallet = window.ethereum.isMathWallet ? 'mathwallet-ethereum' : 'metamask';
    }

    if (!isEthereumExtensionInstalled(wallet as EthereumExtension)) {
      const url: { [key in EthereumExtension]: string } = {
        metamask: 'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN',
        'mathwallet-ethereum': 'https://mathwallet.org/',
      };

      showWarning(wallet, url[wallet as EthereumExtension]);

      return EMPTY;
    }

    if (wallet === 'metamask' && window.ethereum.isMathWallet) {
      notification.warn({
        message: (
          <Trans i18nKey="WalletConflict" i18n={i18n?.use(initReactI18next)}>
            Wallet Conflict
          </Trans>
        ),
        description: (
          <Trans i18nKey="WalletConflictDes" i18n={i18n?.use(initReactI18next)}>
            Lock the mathwallet or switch it to a Non-Ethereum-Type chain
          </Trans>
        ),
      });

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

  if (polkadotExtensions.includes(wallet as unknown as never) && isPolkadotNetwork(chain)) {
    return connectPolkadot(chain, wallet);
  } else if (ethereumExtensions.includes(wallet as unknown as never) && isEthereumNetwork(chain)) {
    return connectMetamask(chain, wallet);
  } else {
    console.log(`🚨 ~${chain.name} do not support wallet: `, wallet);
    return EMPTY;
  }
};
