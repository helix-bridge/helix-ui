import { chain as lodashChain, curry, curryRight, has, isEqual, isNull, omit, pick, upperFirst } from 'lodash';
import Web3 from 'web3';
import { NETWORK_SIMPLE, SYSTEM_NETWORK_CONFIGURATIONS } from '../../config/network';
import {
  Arrival,
  ChainConfig,
  Departure,
  EthereumChainConfig,
  MetamaskNativeNetworkIds,
  Network,
  NetworkCategory,
  NetworkMode,
  Vertices,
} from '../../model';
import { getCustomNetworkConfig } from '../helper/storage';
import { NETWORK_GRAPH } from './graph';

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
  .unionWith((cur, pre) => cur.mode === pre.mode && cur.name === pre.name)
  .map(({ name, mode }) => {
    const config: ChainConfig | undefined = NETWORK_CONFIGURATIONS.find(
      (item) => item.name === name && item.mode === mode
    );

    if (!config) {
      throw new Error(`Can not find ${name} network configuration`);
    }

    return config;
  })
  .sortBy((item) => item.name)
  .valueOf();

function isSpecifyNetworkType(type: NetworkCategory) {
  const findBy = (target: Vertices) =>
    NETWORK_CONFIGURATIONS.find((item) => item.name === target.name && item.mode === target.mode) ?? null;

  return (vertices: ChainConfig | Vertices | null | undefined) => {
    if (!vertices) {
      return false;
    }

    let config = findBy(vertices);

    if (!config) {
      const name = byNetworkAlias(vertices.name);

      console.warn(
        `🚀 ~ Can not find the network config by: ${vertices}. Treat it as an alias, find a network named ${name} by it `
      );
      if (name) {
        config = findBy({ name, mode: vertices.mode });
      }
    }

    return !!config && config.category.includes(type);
  };
}

export function getSupportedChains() {
  return lodashChain([...NETWORK_GRAPH])
    .map(([departure, arrivals]) => [departure, ...arrivals])
    .filter((item) => item.length > 1)
    .flatten()
    .unionWith((cur, pre) => cur.mode === pre.mode && cur.name === pre.name)
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
  const target = [...source].find(([item]) => item.name === departure.name && item.mode === departure.mode);

  return target ? target[1] : [];
};

const isInNodeList = (net1: ChainConfig | null, net2: ChainConfig | null) => {
  if (!net1 || !net2) {
    return true;
  }

  const vertices = getArrivals(NETWORK_GRAPH, net1);

  return !!vertices.find((item) => item.name === net2.name && item.mode === net2.mode);
};

export const isReachable = (net: ChainConfig | null) => curry(isInNodeList)(net); // relation: net1 -> net2 ---- Find the relation by net1
export const isTraceable = (net: ChainConfig | null) => curryRight(isInNodeList)(net); // relation: net1 -> net2 ---- Find the relation by net2
export const isChainConfigEqualTo = curry(isChainConfigEqual);
export const isPolkadotNetwork = isSpecifyNetworkType('polkadot');
export const isEthereumNetwork = isSpecifyNetworkType('ethereum');
export const isTronNetwork = isSpecifyNetworkType('tron');

export function isMetamaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined';
}

/**
 * Unlike metamask, it does not lead the user to unlock the wallet.
 * Tron link may not be initialized, so if it is not detected successfully, delay 2 seconds and detect again.
 * FIXME: If the wallet status changes from unlocked to locked, the account of the last user use will still be available
 */
export async function isTronLinkReady(): Promise<boolean> {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    return true;
  }

  const timeout = 2000;

  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(window.tronWeb && window.tronWeb.defaultAddress.base58);
    }, timeout);
  });
}

/**
 * @description map vertices to chain config
 */
export function verticesToChainConfig(vertices: Vertices) {
  const { mode, name: network } = vertices;

  const config = findNetworkConfig(network);

  return mode === 'native' ? (omit(config, 'dvm') as ChainConfig) : config;
}

export function isSameNetConfig(config1: ChainConfig | null, config2: ChainConfig | null): boolean {
  if (!config1 || !config2) {
    return [config1, config2].every(isNull);
  }

  return isEqual(config1, config2) || (config1.name === config2.name && config1.mode === config2.mode);
}

export function getChainConfigByName(name: Network | null | undefined, mode?: NetworkMode): ChainConfig | null {
  if (name) {
    const config = NETWORK_CONFIGURATIONS.find((item) => item.name === name) ?? null;

    return mode === 'native' ? omit(config, 'dvm') : config;
  }

  console.warn('🚀 Can not find target network config by name: ', name);

  return null;
}

// eslint-disable-next-line complexity
export function getArrival(from: ChainConfig | null | undefined, to: ChainConfig | null | undefined): Arrival | null {
  if (!from || !to) {
    return null;
  }

  let departure = NETWORK_CONFIGURATIONS.find((config) => config.name === from.name) as ChainConfig;

  if (from.mode === 'native') {
    departure = omit(departure, 'dvm');
  }

  if (from.mode === 'dvm' && !Object.prototype.hasOwnProperty.call(departure, 'dvm')) {
    console.warn('Try to get arrival config in dvm mode, but the config does not include dvm info');
  }

  return getArrivals(NETWORK_GRAPH, departure).find((item) => item.name === to.name) ?? null;
}

export async function isNetworkConsistent(network: Network, id = ''): Promise<boolean> {
  id = id && Web3.utils.isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const actualId: string = id ? await Promise.resolve(id) : await window.ethereum.request({ method: 'net_version' });
  const chain = getChainConfigByName(network) as EthereumChainConfig;
  const storedId = chain.ethereumChain.chainId;

  return storedId === actualId;
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

/**
 * @returns - current active account in metamask;
 */
export async function getMetamaskActiveAccount() {
  if (typeof window.ethereum === 'undefined') {
    return;
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });

  // metamask just return the active account now, so the result array contains only one account;
  return accounts[0];
}

export function getDisplayName(config: ChainConfig | null, networkMode?: NetworkMode): string {
  if (!config) {
    return 'unknown';
  }

  const mode = networkMode ?? config.mode;
  const name = upperFirst(config.name);

  return mode === 'dvm' ? `${name}-Smart` : name;
}

export function getVerticesFromDisplayName(name: string): Vertices {
  const [network, mode] = name.split('-') as [Network, string];

  return { name: network, mode: ['smart', 'dvm'].includes(mode?.toLowerCase()) ? 'dvm' : 'native' };
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

/**
 * @description add chain in metamask
 */
export async function addEthereumChain(network: Network): Promise<null> {
  // TODO check the chaiId field, store in decimal in configuration but may be required hexadecimal in metamask side.
  const chain = findNetworkConfig(network) as EthereumChainConfig;
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...chain.ethereumChain, chainId }],
  });

  return result;
}
