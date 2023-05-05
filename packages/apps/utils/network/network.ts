import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import pick from 'lodash/pick';
import sortBy from 'lodash/sortBy';
import unionWith from 'lodash/unionWith';
import upperFirst from 'lodash/upperFirst';
import { SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import {
  Arrival,
  BridgeConfig,
  ChainConfig,
  ContractConfig,
  Departure,
  Network,
  PolkadotChainConfig,
} from 'shared/model';
import { getCustomNetworkConfig } from 'shared/utils/helper/storage';
import { isDVMNetwork } from 'shared/utils/network/network';
import { BRIDGES } from '../../config/bridge';

export const crossChainGraph = BRIDGES.reduce(
  (acc: [Departure, Arrival[]][], bridge: BridgeBase<BridgeConfig<ContractConfig>>) => {
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
  },
  []
);

export const chainConfigs = (() => {
  const data = unionWith(
    crossChainGraph
      .map(([departure, arrivals]) => [departure, ...arrivals])
      .filter((item) => item.length > 1)
      .flat(),
    (pre, next) => pre === next
  ).map((vertices) => {
    const result = SYSTEM_CHAIN_CONFIGURATIONS.find((item) => vertices === item.name);
    let config = cloneDeep(result);

    if (!config) {
      throw new Error(`Can not find ${vertices} network configuration`);
    } else {
      const customConfigs = getCustomNetworkConfig();

      if (customConfigs[config.name]) {
        config = { ...config, ...pick(customConfigs[config.name], Object.keys(config)) } as PolkadotChainConfig;
      }

      config.tokens = config?.tokens.map((token) => ({
        ...token,
        cross: token.cross.filter((item) => !item.deprecated),
      }));
    }

    return config;
  });

  return sortBy(data, (item) => item.name);
})();

function getConfig(name: Network | null | undefined, source = chainConfigs): ChainConfig {
  if (!name) {
    throw new Error(`You must pass a 'name' parameter to find the chain config`);
  }

  const result = source.find((item) => item.name === name);

  if (!result) {
    throw new Error(`Can not find the chain config by ${name}`);
  }

  return result;
}

export const getChainConfig = memoize(getConfig, (name) => name);
export const getOriginChainConfig = memoize(
  (name: Network | null | undefined) => getConfig(name, SYSTEM_CHAIN_CONFIGURATIONS),
  (name) => name
);

// eslint-disable-next-line complexity
export function getDisplayName(config: ChainConfig | null | Network): string {
  if (!config) {
    return 'unknown';
  }

  if (typeof config === 'string') {
    config = getChainConfig(config);
  }

  if (isDVMNetwork(config.name)) {
    return `${upperFirst(config.name.split('-')[0])}`;
  }

  if (config.name.includes('parachain')) {
    return config.name.split('-').map(upperFirst).join(' ');
  }

  return config.fullName ?? `${upperFirst(config.name)} Chain`;
}

export function getWrappedToken(config: ChainConfig) {
  const native = config.tokens.find((item) => item.type === 'native');
  const cross = native?.cross.find((item) => item.partner.name === native.host);

  return config.tokens.find((item) => item.symbol === cross?.partner.symbol)!;
}
