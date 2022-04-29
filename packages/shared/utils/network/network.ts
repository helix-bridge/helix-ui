import { chain as lodashChain, curry, curryRight, isEqual, isNull, pick, upperFirst } from 'lodash';
import Web3 from 'web3';
import { NETWORK_SIMPLE, SYSTEM_ChAIN_CONFIGURATIONS } from '../../config/network';
import {
  Arrival,
  ChainConfig,
  EthereumChainConfig,
  MetamaskNativeNetworkIds,
  Network,
  NetworkCategory,
  NetworkMode,
  TokenType,
  Vertices,
} from '../../model';
import { getCustomNetworkConfig } from '../helper/storage';
import { crossChainGraph } from './graph';

export function isChainEqual(chain1: Vertices | ChainConfig, chain2: Vertices | ChainConfig): boolean {
  return chain1.name === chain2.name && chain1.mode === chain2.mode;
}

export const chainConfigs: ChainConfig[] = lodashChain(crossChainGraph)
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
        config = { ...config, ...pick(customConfigs[config.name], Object.keys(config)) };
      }
    }

    return config;
  })
  .sortBy((item) => item.name)
  .valueOf();

function isSpecifyNetworkType(type: NetworkCategory) {
  const findBy = (target: Vertices) => chainConfigs.find((item) => isChainEqual(item, target)) ?? null;

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

export const isTraceable = (chain: ChainConfig | null) => curryRight(isInNodeList)(chain); // relation: chain1 -> chain2 ---- Find the relation by chain2

export const isChainConfigEqualTo = (chain1: ChainConfig | null) => (chain2: ChainConfig | null) =>
  isEqual(chain1, chain2);

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

export function isSameNetConfig(config1: ChainConfig | null, config2: ChainConfig | null): boolean {
  if (!config1 || !config2) {
    return [config1, config2].every(isNull);
  }

  return isEqual(config1, config2) || (config1.name === config2.name && config1.mode === config2.mode);
}

// eslint-disable-next-line complexity
export function getChainConfig(
  data: Vertices | Network | string | null | undefined,
  mode: NetworkMode | TokenType = 'native',
  chain?: Network
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
        if (chain) {
          target = targets.find((item) => item.mode === mode && item.name === chain);
        } else {
          target = targets.find((item) => item.tokens.find((token) => token.symbol === data && token.type === mode));
        }
      }

      if (!target) {
        throw new Error(`Can not find the chain config by args: tokenName: ${data}, mode: ${mode}, chain: ${chain} `);
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

export function getArrival(from: ChainConfig | null | undefined, to: ChainConfig | null | undefined): Arrival | null {
  if (!from || !to) {
    return null;
  }

  const departure = getChainConfig(from);

  return getArrivals(departure).find((item) => isEqual(item, to)) ?? null;
}

export async function isNetworkConsistent(network: Network, id = ''): Promise<boolean> {
  id = id && Web3.utils.isHex(id) ? parseInt(id, 16).toString() : id;
  // id 1: eth mainnet 3: ropsten 4: rinkeby 5: goerli 42: kovan  43: pangolin 44: crab
  const actualId: string = id ? await Promise.resolve(id) : await window.ethereum.request({ method: 'net_version' });
  const chain = getChainConfig(network) as EthereumChainConfig;
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
  const chain = getChainConfig(network) as EthereumChainConfig;

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

  return { name: network, mode: mode?.toLowerCase() === 'smart' ? 'dvm' : 'native' };
}

export function isChainIdEqual(id1: string | number, id2: string | number): boolean {
  id1 = Web3.utils.toHex(id1);
  id2 = Web3.utils.toHex(id2);

  return id1 === id2;
}

/**
 * @description add chain in metamask
 */
export async function addEthereumChain(network: Network): Promise<null> {
  // TODO check the chaiId field, store in decimal in configuration but may be required hexadecimal in metamask side.
  const chain = getChainConfig(network) as EthereumChainConfig;
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...chain.ethereumChain, chainId }],
  });

  return result;
}
