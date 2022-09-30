import isEqual from 'lodash/isEqual';
import { Arrival, BridgeBase, BridgeConfig, ContractConfig, Departure } from 'shared/model';
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
