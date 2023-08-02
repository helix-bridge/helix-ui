import isEqual from 'lodash/isEqual';
import upperFirst from 'lodash/upperFirst';
import { BridgeBase } from 'shared/core/bridge';
import { BridgeCategory, BridgeConfig, CrossChainPureDirection, CrossOverview } from 'shared/model';
import { unknownUnavailable } from '../../bridges/unknown-unavailable/config';
import { BRIDGES } from '../../config/bridge';

export function getOverview(direction: CrossChainPureDirection, category?: BridgeCategory): CrossOverview | undefined {
  const { from, to } = direction;
  const overviews = from.cross.filter((item) => item.partner.name === to.host && item.partner.symbol === to.symbol);
  const overview: CrossOverview | undefined = overviews[0];

  if (overviews.length > 1) {
    if (category) {
      return overviews.find((item) => item.category.toLowerCase() === category.toLowerCase());
    } else {
      console.warn(
        `Found multiple transfer paths for ${direction.from.symbol} to ${direction.to.symbol}. Pass the category argument get a more specific bridge`
      );
    }
  }
  return overview;
}

export function getBridge<T extends BridgeConfig>(
  direction: CrossChainPureDirection,
  category?: BridgeCategory
): BridgeBase<T> {
  const overview = getOverview(direction, category);

  if (!overview) {
    return unknownUnavailable as unknown as BridgeBase<T>;
  }

  const bridges = getBridges(direction);
  const bridge = bridges.find((item) => item.name === overview?.bridge);

  if (!bridge) {
    return unknownUnavailable as unknown as BridgeBase<T>;
  }

  return bridge as BridgeBase<T>;
}

export function getBridges(source: CrossChainPureDirection): BridgeBase[] {
  const {
    from: { cross },
    to,
  } = source;

  const overviews = cross.filter((bridge) => {
    const { partner } = bridge;

    return (
      partner.symbol.toLowerCase() === to.symbol.toLowerCase() &&
      isEqual(partner.name, to.meta.name) &&
      !bridge.deprecated
    );
  });

  return BRIDGES.filter(
    (bridge) =>
      bridge.isTest === source.from.meta.isTest &&
      (bridge.isIssue(source.from.meta, source.to.meta) || bridge.isRedeem(source.from.meta, source.to.meta)) &&
      overviews.find((overview) => overview.category === bridge.category && overview.bridge === bridge.name)
  );
}

export function bridgeCategoryDisplay(category: BridgeCategory) {
  if (category === 'l1tol2') {
    return 'L2Bridge';
  } else if (category === 'lnbridgev20-opposite' || category === 'lnbridgev20-default') {
    return 'Helix LnBridge';
  }
  return /^[a-z]+$/.test(category) ? upperFirst(category) : category;
}
