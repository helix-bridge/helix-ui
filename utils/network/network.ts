import { ApiPromise } from '@polkadot/api';
import { chain as lodashChain, curry, curryRight, has, isEqual, isNull, omit, once, pick, upperFirst } from 'lodash';
import Web3 from 'web3';
import { NETWORK_SIMPLE, SYSTEM_NETWORK_CONFIGURATIONS, tronConfig } from '../../config/network';
import {
  Arrival,
  ChainConfig,
  Connection,
  CrossType,
  Departure,
  DVMChainConfig,
  EthereumChainConfig,
  EthereumConnection,
  MetamaskNativeNetworkIds,
  Network,
  NetworkCategory,
  NetworkMode,
  NoNullFields,
  PolkadotChain,
  PolkadotConnection,
  Vertices,
} from '../../model';
import { getUnit } from '../helper/balance';
import { getCustomNetworkConfig } from '../helper/storage';
import { entrance } from '../connection/entrance';
import { AIRDROP_GRAPH, NETWORK_GRAPH } from './graph';

export const NETWORK_CONFIGURATIONS = SYSTEM_NETWORK_CONFIGURATIONS.map((item) => {
  const customConfigs = getCustomNetworkConfig();

  return customConfigs[item.name] ? { ...item, ...pick(customConfigs[item.name], Object.keys(item)) } : item;
});

/**
 * generate network configs, use dvm field to distinct whether the config is dvm config.
 */
export const CROSS_CHAIN_NETWORKS: ChainConfig[] = lodashChain([...NETWORK_GRAPH])
  .map(([departure, arrivals]) => [departure, ...arrivals])
  .filter((item) => item.length > 1)
  .flatten()
  .unionWith((cur, pre) => cur.mode === pre.mode && cur.network === pre.network)
  .map(({ network, mode }) => {
    const config: ChainConfig | undefined = NETWORK_CONFIGURATIONS.find((item) => item.name === network);

    if (!config) {
      throw new Error(`Can not find ${network} network configuration`);
    }

    return config.type.includes('polkadot') && mode === 'native'
      ? (omit(config, 'dvm') as Omit<ChainConfig, 'dvm'>)
      : config;
  })
  .sortBy((item) => item.name)
  .valueOf();

export const AIRPORT_NETWORKS: ChainConfig[] = NETWORK_CONFIGURATIONS.filter((item) =>
  ['ethereum', 'crab', 'tron'].includes(item.name)
).map((item) => omit(item, 'dvm'));

function isSpecifyNetworkType(type: NetworkCategory) {
  const findBy = (name: Network) => NETWORK_CONFIGURATIONS.find((item) => item.name === name) ?? null;

  return (network: Network | null | undefined) => {
    if (!network) {
      return false;
    }

    let config = findBy(network);

    if (!config) {
      const name = byNetworkAlias(network);

      console.warn(
        `🚀 ~ Can not find the network config by: ${network}. Treat it as an alias, find a network named ${name} by it `
      );
      if (name) {
        config = findBy(name);
      }
    }

    return !!config && config.type.includes(type);
  };
}

export function getSupportedChains() {
  return lodashChain([...NETWORK_GRAPH])
    .map(([departure, arrivals]) => [departure, ...arrivals])
    .filter((item) => item.length > 1)
    .flatten()
    .unionWith((cur, pre) => cur.mode === pre.mode && cur.network === pre.network)
    .valueOf();
}

function byNetworkAlias(network: string): Network | null {
  const minLength = 3;

  const allowAlias: (full: string, at?: number) => string[] = (name, startAt = minLength) => {
    const len = name.length;
    const shortestName = name.slice(0, startAt);

    return new Array(len - startAt).fill('').map((_, index) => shortestName + name.substr(startAt, index));
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

const isChainConfigEqual = (net1: ChainConfig | null, net2: ChainConfig | null) => isEqual(net1, net2);

const getArrivals = (source: Map<Departure, Arrival[]>, departure: ChainConfig) => {
  const mode: NetworkMode = getNetworkMode(departure);
  const target = [...source].find(([item]) => item.network === departure.name && item.mode === mode);

  return target ? target[1] : [];
};

const isInNodeList = (source: Map<Departure, Arrival[]>) => (net1: ChainConfig | null, net2: ChainConfig | null) => {
  if (!net1 || !net2) {
    return true;
  }

  const vertices = getArrivals(source, net1);

  return !!vertices.find((item) => item.network === net2.name && item.mode === getNetworkMode(net2));
};

const isInCrossList = isInNodeList(NETWORK_GRAPH);
const isInAirportList = isInNodeList(AIRDROP_GRAPH);

export const isReachable = (net: ChainConfig | null, type: CrossType = 'cross-chain') =>
  type === 'cross-chain' ? curry(isInCrossList)(net) : curry(isInAirportList)(net); // relation: net1 -> net2 ---- Find the relation by net1
export const isTraceable = (net: ChainConfig | null, type: CrossType = 'cross-chain') =>
  type === 'cross-chain' ? curryRight(isInCrossList)(net) : curryRight(isInAirportList)(net); // relation: net1 -> net2 ---- Find the relation by net2
export const isChainConfigEqualTo = curry(isChainConfigEqual);
export const isPolkadotNetwork = isSpecifyNetworkType('polkadot');
export const isEthereumNetwork = isSpecifyNetworkType('ethereum');
export const isTronNetwork = isSpecifyNetworkType('tron');

export function getNetworkMode(config: ChainConfig): NetworkMode {
  return has(config, 'dvm') ? 'dvm' : 'native';
}

export function isDVM(config: ChainConfig): boolean {
  return getNetworkMode(config) === 'dvm';
}

/**
 * @description map chain config to vertices
 */
export function chainConfigToVertices(config: ChainConfig) {
  const vertices: Vertices = { network: config.name, mode: getNetworkMode(config) };

  return vertices;
}

/**
 * @description map vertices to chain config
 */
export function verticesToChainConfig(vertices: Vertices) {
  const { mode, network } = vertices;

  const config = findNetworkConfig(network);

  return mode === 'native' ? (omit(config, 'dvm') as ChainConfig) : config;
}

export function isSameNetConfig(config1: ChainConfig | null, config2: ChainConfig | null): boolean {
  if (!config1 || !config2) {
    return [config1, config2].every(isNull);
  }

  return (
    isEqual(config1, config2) || (config1.name === config2.name && getNetworkMode(config1) === getNetworkMode(config2))
  );
}

export function getChainConfigByName(name: Network | null | undefined): ChainConfig | null {
  if (name) {
    return NETWORK_CONFIGURATIONS.find((item) => item.name === name) ?? null;
  }

  console.warn('🚀 Can not find target network config by name: ', name);

  return null;
}

// eslint-disable-next-line complexity
export function getArrival(from: ChainConfig | null | undefined, to: ChainConfig | null | undefined): Arrival | null {
  if (!from || !to) {
    return null;
  }

  const mode = getNetworkMode(from);
  let departure = NETWORK_CONFIGURATIONS.find((config) => config.name === from.name) as ChainConfig;

  if (mode === 'native') {
    departure = omit(departure, 'dvm');
  }

  if (mode === 'dvm' && !Object.prototype.hasOwnProperty.call(departure, 'dvm')) {
    console.warn('Try to get arrival config in dvm mode, but the config does not include dvm info');
  }

  return getArrivals(NETWORK_GRAPH, departure).find((item) => item.network === to.name) ?? null;
}

export function isNativeMetamaskChain(network: Network): boolean {
  const ids = [
    MetamaskNativeNetworkIds.ethereum,
    MetamaskNativeNetworkIds.ropsten,
    MetamaskNativeNetworkIds.rinkeby,
    MetamaskNativeNetworkIds.goerli,
    MetamaskNativeNetworkIds.kovan,
  ];
  const chain = getChainConfigByName(network) as EthereumChainConfig;

  return ids.includes(+chain.ethereumChain.chainId);
}

export function getNetworkCategory(config: ChainConfig): NetworkCategory | null {
  if (config.type.includes('polkadot')) {
    return isDVM(config) ? 'dvm' : 'polkadot';
  } else if (config.type.includes('ethereum')) {
    return 'ethereum';
  } else if (config.type.includes('tron')) {
    return 'tron';
  }

  return null;
}

/**
 *
 * @params network id
 * @description is actual network id match with expected.
 */
export async function isNetworkMatch(expectNetworkId: number): Promise<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const networkId = await web3.eth.net.getId();

  return expectNetworkId === networkId;
}

export function getDisplayName(config: ChainConfig): string {
  const mode = getNetworkMode(config);
  const name = upperFirst(config.name);

  return mode === 'dvm' ? `${name}-Smart` : name;
}

export function getVerticesFromDisplayName(name: string): Vertices {
  const [network, mode] = name.split('-') as [Network, string];

  return { network, mode: ['smart', 'dvm'].includes(mode?.toLowerCase()) ? 'dvm' : 'native' };
}

// eslint-disable-next-line complexity
export async function getConfigByConnection(connection: Connection): Promise<ChainConfig | null> {
  if (connection.type === 'metamask') {
    const targets = CROSS_CHAIN_NETWORKS.filter((item) => {
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
    const target = findNetworkConfig(network);

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

export function isChainIdEqual(id1: string | number, id2: string | number): boolean {
  id1 = Web3.utils.toHex(id1);
  id2 = Web3.utils.toHex(id2);

  return id1 === id2;
}

export function getCrossChainArrivals(dep: ChainConfig | Vertices): Arrival[] {
  const departure = has(dep, 'mode') ? verticesToChainConfig(dep as Vertices) : (dep as ChainConfig);

  return getArrivals(NETWORK_GRAPH, departure);
}

export function findNetworkConfig(network: Network | string): ChainConfig {
  const target = NETWORK_CONFIGURATIONS.find((item) => item.name === network || item.name === byNetworkAlias(network));

  if (!target) {
    throw new Error(`Can not find chain configuration by ${network}`);
  }

  return target;
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
