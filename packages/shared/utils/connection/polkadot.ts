import { ApiPromise } from '@polkadot/api';
import { once } from 'lodash';
import { tronConfig } from '../../config/network';
import {
  ChainConfig,
  Connection,
  EthereumChainConfig,
  EthereumConnection,
  NoNullFields,
  PolkadotChainSimpleToken,
  PolkadotConnection,
} from '../../model';
import { chainConfigs, getChainConfig, isChainIdEqual } from '../network';

// eslint-disable-next-line complexity
export async function getConfigByConnection(connection: Connection): Promise<ChainConfig | null> {
  if (connection.type === 'metamask') {
    const target = chainConfigs.find((item) => {
      const chain = (item as unknown as EthereumChainConfig).ethereumChain;

      return chain && isChainIdEqual(chain.chainId, (connection as EthereumConnection).chainId);
    });

    return target ?? null;
  }

  if (connection.type === 'polkadot' && connection.api) {
    const { api } = connection as NoNullFields<PolkadotConnection>;

    await waitUntilConnected(api);

    const chain = await api?.rpc.system.chain();
    const network = chain.toHuman()?.toLowerCase();

    return getChainConfig(network);
  }

  if (connection.type === 'tron') {
    return tronConfig;
  }

  return null;
}

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
