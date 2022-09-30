import isEqual from 'lodash/isEqual';
import unionWith from 'lodash/unionWith';
import upperFirst from 'lodash/upperFirst';
import { BridgeCategory, BridgeConfig, ChainConfig, CrossChainDirection, Network } from 'shared/model';
import { unknownUnavailable } from '../../bridges/unknown-unavailable/config/bridge';
import { BRIDGES } from '../../config/bridge';
import { Bridge, CommonBridge } from '../../model/bridge';
import { crossChainGraph, getChainConfig } from '../network';

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Network | ChainConfig, Network | ChainConfig]
): Bridge<T, ChainConfig, ChainConfig> {
  const direction = Array.isArray(source)
    ? source.map((item) => (typeof item === 'object' ? item.name : (item as Network)))
    : [source.from, source.to].map((item) => {
        const conf = item.meta ?? getChainConfig(item.host);

        return conf.name;
      });

  const bridge = BRIDGES.find((item) => isEqual(item.issue, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    return unknownUnavailable as Bridge<T, ChainConfig, ChainConfig>;
  }

  return bridge as Bridge<T, ChainConfig, ChainConfig>;
}

export function getBridges(source: CrossChainDirection): CommonBridge[] {
  const {
    from: { cross },
    to,
  } = source;

  const overviews = cross.filter((bridge) => {
    const { partner } = bridge;

    return partner.symbol.toLowerCase() === to.symbol.toLowerCase() && isEqual(partner.name, to.meta.name);
  });

  return BRIDGES.filter(
    (bridge) =>
      bridge.isTest === source.from.meta.isTest &&
      (bridge.isIssue(source.from.meta, source.to.meta) || bridge.isRedeem(source.from.meta, source.to.meta)) &&
      overviews.find((overview) => overview.category === bridge.category && overview.bridge === bridge.name)
  ) as CommonBridge[];
}

export function bridgeCategoryDisplay(category: BridgeCategory) {
  return /^[a-z]+$/.test(category) ? upperFirst(category) : category;
}

const calcBridgesAmount = (data: [Network, Network[]][]) =>
  unionWith(
    data.map(([from, tos]) => tos.map((to) => [from, to])).flat(),
    (pre, cur) => isEqual(pre, cur) || isEqual(pre.reverse(), cur)
  );

export const formalBridges = calcBridgesAmount(crossChainGraph.filter((item) => !getChainConfig(item[0]).isTest));
export const testBridges = calcBridgesAmount(crossChainGraph.filter((item) => getChainConfig(item[0]).isTest));
