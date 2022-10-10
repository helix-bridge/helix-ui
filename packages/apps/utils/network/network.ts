import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import upperFirst from 'lodash/upperFirst';
import { SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { DVMChain, EthereumChain, ParachainChain, PolkadotChain } from 'shared/core/chain';
import {
  Arrival,
  BridgeConfig,
  ChainConfig,
  ContractConfig,
  Departure,
  DVMChainConfig,
  EthereumChainConfig,
  Network,
  ParachainChainConfig,
  PolkadotChainConfig,
} from 'shared/model';
import { getCustomNetworkConfig } from 'shared/utils/helper/storage';
import { isDVMNetwork, isParachainNetwork, isPolkadotNetwork } from 'shared/utils/network/network';
import { Bridge } from '../../core/bridge';

export const genCrossChainGraph = (bridges: Bridge<BridgeConfig, ChainConfig, ChainConfig>[]) =>
  bridges.reduce((acc: [Departure, Arrival[]][], bridge: BridgeBase<BridgeConfig<ContractConfig>>) => {
    const check = ([ver1, ver2]: [Departure, Departure]) => {
      const departure = acc.find((item) => isEqual(item[0], ver1));
      if (departure) {
        departure[1].push(ver2);
      } else {
        acc.push([ver1, [ver2]]);
      }
    };

    check(bridge.issue);
    check(bridge.redeem);

    return acc;
  }, []);

export const chainConfigs = (() => {
  const data = SYSTEM_CHAIN_CONFIGURATIONS.map((result) => {
    let config = cloneDeep(result);

    const customConfigs = getCustomNetworkConfig();

    if (customConfigs[config.name]) {
      config = { ...config, ...pick(customConfigs[config.name], Object.keys(config)) } as PolkadotChainConfig;
    }

    config.tokens = config?.tokens.map((token) => ({
      ...token,
      cross: token.cross.filter((item) => !item.deprecated),
    }));

    return config as PolkadotChainConfig | EthereumChainConfig | ParachainChainConfig;
  });

  return sortBy(data, (item) => item.name);
})();

export const toChain = (conf: ChainConfig) => {
  if (isParachainNetwork(conf)) {
    return new ParachainChain(conf as ParachainChainConfig);
  }

  if (isPolkadotNetwork(conf)) {
    return new PolkadotChain(conf as PolkadotChainConfig);
  }

  if (isDVMNetwork(conf)) {
    return new DVMChain(conf as DVMChainConfig);
  }

  return new EthereumChain(conf as EthereumChainConfig);
};

function getConfig(name: Network | null | undefined): ParachainChain | PolkadotChain | EthereumChain {
  if (!name) {
    throw new Error(`You must pass a 'name' parameter to find the chain config`);
  }

  const chains: (ParachainChain | PolkadotChain | EthereumChain)[] = SYSTEM_CHAIN_CONFIGURATIONS.map(toChain);
  const result = chains.find((item) => item.name === name);

  if (!result) {
    throw new Error(`Can not find the chain config by ${name}`);
  }

  return result;
}

export const getChainConfig = memoize(getConfig, (name) => name);

// eslint-disable-next-line complexity
export function getDisplayName(config: ChainConfig | null | Network): string {
  if (!config) {
    return 'unknown';
  }

  if (typeof config === 'string') {
    config = getChainConfig(config);
  }

  if (isDVMNetwork(config.name)) {
    return `${upperFirst(config.name.split('-')[0])} Smart Chain`;
  }

  if (config.name.includes('parachain')) {
    return config.name.split('-').map(upperFirst).join(' ');
  }

  return config.fullName ?? `${upperFirst(config.name)} Chain`;
}
