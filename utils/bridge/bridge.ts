import { has, isEqual, pick } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { Bridge, BridgeConfig, ChainConfig, CrossChainDirection, Vertices } from '../../model';
import { chainConfigToVertices } from '../network/network';

export function getBridge<T extends BridgeConfig>(
  source: CrossChainDirection | [Vertices | ChainConfig, Vertices | ChainConfig]
): Bridge<T> {
  const data = Array.isArray(source) ? source : ([source.from, source.to] as [ChainConfig, ChainConfig]);

  const direction = data.map((item) => {
    const asVertices = has(item, 'network') && has(item, 'mode');

    if (asVertices) {
      return pick(item as Vertices, ['network', 'mode']) as Vertices;
    }

    return chainConfigToVertices(item as ChainConfig);
  });

  const bridge = BRIDGES.find((item) => isEqual(item.issuing, direction) || isEqual(item.redeem, direction));

  if (!bridge) {
    throw new Error(
      `Bridge from ${direction[0]?.network}(${direction[0].mode}) to ${direction[1]?.network}(${direction[1].mode}) is not exist`
    );
  }

  return bridge as Bridge<T>;
}
