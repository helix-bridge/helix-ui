import { chain as lodashChain, curry, isEqual, pick, upperFirst } from 'lodash';
import { NETWORK_SIMPLE, SYSTEM_ChAIN_CONFIGURATIONS } from '../../config/network';
import {
  ChainConfig,
  EthereumChainConfig,
  EthereumTypeNetwork,
  MetamaskNativeNetworkIds,
  Network,
  NetworkMode,
  PolkadotChainConfig,
  PolkadotTypeNetwork,
  TokenType,
  Vertices,
} from '../../model';
import { getCustomNetworkConfig } from '../helper/storage';
import { crossChainGraph } from './graph';

export function isChainEqual(chain1: Vertices | ChainConfig, chain2: Vertices | ChainConfig): boolean {
  return chain1.name === chain2.name && chain1.mode === chain2.mode;
}

export const chainConfigs = lodashChain(crossChainGraph)
  .map(([departure, arrivals]) => [departure, ...arrivals])
  .filter((item) => item.length > 1)
  .flatten()
  .unionWith(isChainEqual)
  .map((vertices) => {
    let config = SYSTEM_ChAIN_CONFIGURATIONS.find((item) => isChainEqual(vertices, item));

    if (!config) {
      throw new Error(`Can not find ${vertices.name} network configuration`);
    } else {
      const customConfigs = getCustomNetworkConfig();

      if (customConfigs[config.name]) {
        config = { ...config, ...pick(customConfigs[config.name], Object.keys(config)) } as PolkadotChainConfig;
      }
    }

    return config;
  })
  .sortBy((item) => item.name)
  .valueOf();

function byNetworkAlias(network: string): Network | null {
  const minLength = 3;

  const allowAlias: (full: string, at?: number) => string[] = (name, startAt = minLength) => {
    const len = name.length;
    const shortestName = name.slice(0, startAt);

    return new Array(len - startAt).fill('').map((_, index) => shortestName + name.slice(startAt, index));
  };

  const alias = new Map([
    ['ethereum', [...allowAlias('ethereum')]],
    ['crab', ['darwinia crab']],
  ]);

  let res = null;

  for (const [name, value] of alias) {
    if (value.find((item) => item === network.toLowerCase())) {
      res = name;
      break;
    }
  }

  return res as Network | null;
}

export function getLegalName(network: string): Network | string {
  if (NETWORK_SIMPLE.find((item) => item.name === network)) {
    return network;
  }

  return byNetworkAlias(network) || network;
}

export const getArrivals = (departure: ChainConfig) => {
  const target = crossChainGraph.find(([item]) => isChainEqual(item, departure));

  return target ? target[1] : [];
};

const isInNodeList = (chain1: ChainConfig | null, chain2: ChainConfig | null) => {
  if (!chain1 || !chain2) {
    return true;
  }

  const vertices = getArrivals(chain1);

  return !!vertices.find((item) => isChainEqual(item, chain2));
};

export const isReachable = (chain: ChainConfig | null) => curry(isInNodeList)(chain); // relation: chain1 -> chain2 ---- Find the relation by chain1

export const isChainConfigEqualTo = (chain1: ChainConfig | null) => (chain2: ChainConfig | null) =>
  isEqual(chain1, chain2);

export const isPolkadotNetwork = (network: ChainConfig | Vertices | null | undefined) => {
  if (!network) {
    return false;
  }

  const known: PolkadotTypeNetwork[] = ['crab', 'darwinia', 'pangolin', 'pangoro', 'polkadot'];

  return known.includes(network.name as PolkadotTypeNetwork);
};

export const isEthereumNetwork = (network: ChainConfig | Vertices | null | undefined) => {
  if (!network) {
    return false;
  }

  const known: EthereumTypeNetwork[] = ['ethereum', 'ropsten', 'heco', 'polygon'];

  return known.includes(network.name as EthereumTypeNetwork);
};

/**
 * find chain config by:
 * 1. Vertices only, omit mode parameter
 * 2. [chain name, chain mode]
 * 3. [token symbol name, chain mode]
 * 4. [token symbol name, chain name]
 */
// eslint-disable-next-line complexity
export function getChainConfig(
  data: Vertices | Network | string | null | undefined,
  mode: NetworkMode | TokenType | Network = 'native'
): ChainConfig {
  if (!data) {
    throw new Error(`You must pass a 'name' parameter to find the chain config`);
  }

  let compared: Vertices;

  if (typeof data === 'string') {
    const isChainName = chainConfigs.map((item) => item.name).includes(data as Network);

    if (isChainName) {
      compared = { name: data, mode } as Vertices;
    } else {
      const targets = chainConfigs.filter((item) => item.tokens.map((tk) => tk.symbol).includes(data));
      let target: ChainConfig | undefined;

      if (targets.length === 1) {
        target = targets[0];
      } else {
        if (['native', 'dvm', 'mapping'].includes(mode)) {
          target = targets.find((item) => item.mode === mode);
        } else {
          target = targets.find((item) => item.name === mode);
        }
      }

      if (!target) {
        throw new Error(`Can not find the chain config by args: tokenName: ${data}, mode: ${mode} `);
      }

      return target;
    }
  } else {
    compared = data;
  }

  const result = chainConfigs.find((item) => isChainEqual(item, compared));

  if (!result) {
    throw new Error(`Can not find the chain config by ${JSON.stringify(compared)}`);
  }

  return result;
}

export function isNativeMetamaskChain(chain: EthereumChainConfig): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];

  return ids.includes(+chain.ethereumChain.chainId);
}

export function getDisplayName(config: ChainConfig | null, networkMode?: NetworkMode): string {
  if (!config) {
    return 'unknown';
  }

  const mode = networkMode ?? config.mode;
  const name = upperFirst(config.name);

  return isPolkadotNetwork(config) && mode === 'dvm' ? `${name}-Smart` : name;
}

export function getVerticesFromDisplayName(name: string): Vertices {
  const [network, mode] = name.split('-') as [Network, string];

  return { name: network, mode: mode?.toLowerCase() === 'smart' ? 'dvm' : 'native' };
}
