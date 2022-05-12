import { Modal } from 'antd';
import Link from 'antd/lib/typography/Link';
import { Trans } from 'react-i18next';
import { EMPTY, from, mergeMap, Observable, switchMap } from 'rxjs';
import {
  ChainConfig,
  Connection,
  EthereumChainConfig,
  EthereumConnection,
  PolkadotChainConfig,
  PolkadotConnection,
  SupportedWallet,
} from '../../model';
import { isMetamaskInstalled, isNetworkConsistent } from '../network';
import { getMetamaskConnection, switchMetamaskNetwork } from './metamask';
import { getPolkadotConnection } from './polkadot';

type ConnectFn<T extends Connection> = (network: ChainConfig, extension?: SupportedWallet) => Observable<T>;

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

const connectPolkadot: ConnectFn<PolkadotConnection> = (network) =>
  !network ? EMPTY : getPolkadotConnection(network as PolkadotChainConfig);

const connectMetamask: ConnectFn<EthereumConnection> = (network, chainId?) => {
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
        ? getMetamaskConnection()
        : switchMetamaskNetwork(network as EthereumChainConfig)!.pipe(mergeMap(() => getMetamaskConnection()))
    )
  );
};

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
