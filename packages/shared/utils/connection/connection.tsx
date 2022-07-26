import { Modal } from 'antd';
import Link from 'antd/lib/typography/Link';
import { Trans } from 'react-i18next';
import { EMPTY, from, mergeMap, Observable, switchMap } from 'rxjs';
import Web3 from 'web3';
import {
  ChainConfig,
  Connection,
  EthereumChainConfig,
  EthereumConnection,
  PolkadotChainConfig,
  PolkadotConnection,
  SupportedWallet,
} from '../../model';
import { chainConfigs } from '../network';
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

export async function isNetworkConsistent(chain: EthereumChainConfig, id = ''): Promise<boolean> {
  id = id && Web3.utils.isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const actualId: string | number = id ? await Promise.resolve(id) : await web3.eth.net.getId();
  const storedId = chain.ethereumChain.chainId;

  return storedId === Web3.utils.toHex(actualId);
}

const connectMetamask: ConnectFn<EthereumConnection> = (network, chainId?) => {
  if (!isMetamaskInstalled()) {
    showWarning(
      'metamask',
      'https://chrome.google.com/webstore/detail/empty-title/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN'
    );

    return EMPTY;
  }

  return from(isNetworkConsistent(network as EthereumChainConfig, chainId)).pipe(
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

export function convertConnectionToChainConfig(connection: Connection): ChainConfig | null {
  const { type, chainId } = connection;

  if (type === 'unknown') {
    return null;
  }

  const config = chainConfigs.find((item) => {
    const typeMatch = item.wallets.includes(type);
    const value = (item as EthereumChainConfig).ethereumChain
      ? (item as EthereumChainConfig).ethereumChain.chainId
      : item.name;

    return typeMatch && value === chainId;
  });

  return config ?? null;
}
