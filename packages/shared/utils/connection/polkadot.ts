import { ApiPromise } from '@polkadot/api';
import { omit, once } from 'lodash';
import { tronConfig } from '../../config/network';
import {
  ChainConfig,
  Connection,
  DVMChainConfig,
  EthereumChainConfig,
  EthereumConnection,
  NoNullFields,
  PolkadotChain,
  PolkadotConnection,
} from '../../model';
import { getUnit } from '../helper';
import { chainConfigs, getChainConfig, isChainIdEqual } from '../network';

// eslint-disable-next-line complexity
export async function getConfigByConnection(connection: Connection): Promise<ChainConfig | null> {
  if (connection.type === 'metamask') {
    const targets = chainConfigs.filter((item) => {
      const chain = (item as unknown as EthereumChainConfig).ethereumChain;

      return chain && isChainIdEqual(chain.chainId, (connection as EthereumConnection).chainId);
    });

    return (targets.length > 1 ? targets.find((item) => (item as unknown as DVMChainConfig).dvm) : targets[0]) ?? null;
  }

  if (connection.type === 'polkadot' && connection.api) {
    const { api } = connection as NoNullFields<PolkadotConnection>;

    await waitUntilConnected(api);

    const chain = await api?.rpc.system.chain();
    const network = chain.toHuman()?.toLowerCase();
    const target = getChainConfig(network);

    return chain ? omit(target, 'dvm') : null;
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

export async function getPolkadotChainProperties(api: ApiPromise): Promise<PolkadotChain> {
  const chainState = await api?.rpc.system.properties();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { tokenDecimals, tokenSymbol, ss58Format } = chainState?.toHuman() as any;

  return tokenDecimals.reduce(
    (acc: PolkadotChain, decimal: string, index: number) => {
      const unit = getUnit(+decimal);
      const token = { decimal: unit, symbol: tokenSymbol[index] };

      return { ...acc, tokens: [...acc.tokens, token] };
    },
    { ss58Format, tokens: [] } as PolkadotChain
  );
}
