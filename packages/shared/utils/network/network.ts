import { chain as lodashChain, pick, upperFirst } from 'lodash';
import { NETWORK_SIMPLE, SYSTEM_ChAIN_CONFIGURATIONS } from '../../config/network';
import {
  knownDarwiniaDVMNetworks,
  knownDarwiniaNetworks,
  knownEthereumNetworks,
  knownPolkadotNetworks,
} from '../../config/network/category';
import { ChainConfig, Network, NetworkMode, PolkadotChainConfig, TokenType, Vertices } from '../../model';
import { getCustomNetworkConfig } from '../helper/storage';
import { crossChainGraph } from './graph';

function isChainEqual(chain1: Vertices | ChainConfig, chain2: Vertices | ChainConfig): boolean {
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

  return target ? target[1].map((item) => getChainConfig(item)) : [];
};

const isSpecifyNetwork = (known: Vertices[]) => (network: ChainConfig | Vertices | null | undefined) => {
  if (!network) {
    return false;
  }

  return known.some((item) => isChainEqual(item, network));
};

export const isPolkadotNetwork = isSpecifyNetwork(knownPolkadotNetworks);

export const isDarwiniaNetwork = isSpecifyNetwork(knownDarwiniaNetworks);

export const isDarwiniaDVMNetwork = isSpecifyNetwork(knownDarwiniaDVMNetworks);

export const isEthereumNetwork = isSpecifyNetwork(knownEthereumNetworks);

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

export function getDisplayName(config: ChainConfig | null, networkMode?: NetworkMode): string {
  if (!config) {
    return 'unknown';
  }

  const mode = networkMode ?? config.mode;
  const name = upperFirst(config.name);

  return mode === 'dvm' ? `${name} Smart Chain` : name;
}
