import { isHex } from '@polkadot/util';
import { Modal } from 'antd';
import { Trans } from 'react-i18next';
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
import { getPolkadotConnection } from './polkadot';

type ConnectFn<T extends Connection> = (network: ChainConfig, extension?: SupportedWallet) => Observable<T>;

const showWarning = (plugin: string, downloadUrl: string) =>
  Modal.warn({
    title: <Trans>Missing Wallet Plugin</Trans>,
    content: (
      <Trans i18nKey="MissingPlugin">
        We need {{ plugin }} plugin to continue. Please
        <a href={downloadUrl} target="_blank" rel="noreferrer">
          install
        </a>
        or <a>enable</a> it first.
      </Trans>
    ),
    okText: <Trans>OK</Trans>,
  });

const connectPolkadot: ConnectFn<PolkadotConnection> = (network) =>
  !network ? EMPTY : getPolkadotConnection(network as PolkadotChainConfig);

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
        return isMatch ? fn() : switchMetamaskNetwork(network as EthereumChainConfig)!.pipe(mergeMap(() => fn()));
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
};

export const connect: ConnectFn<Connection> = (chain, wallet) => {
  const { wallets } = chain;

  if (wallet && !wallets.includes(wallet)) {
    console.log(`🚨 ~${chain.name} do not support wallet: `, wallet);
    return EMPTY;
  }

  return walletConnections[wallet ?? chain.wallets[0]](chain, wallet);
};
