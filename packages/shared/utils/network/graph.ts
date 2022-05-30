import { isEqual } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { Arrival, Bridge, BridgeConfig, ContractConfig, Departure } from '../../model';

export const crossChainGraph = BRIDGES.reduce(
  (acc: [Departure, Arrival[]][], bridge: Bridge<BridgeConfig<ContractConfig>>) => {
    const check = ([ver1, ver2]: [Departure, Departure]) => {
      const departure = acc.find((item) => isEqual(item[0], ver1));
      if (departure) {
        departure[1].push(ver2);
      } else {
        acc.push([{ ...ver1 }, [{ ...ver2 }]]);
      }
    };

    check(bridge.issuing);
    check(bridge.redeem);

    return acc;
  },
  []
);
