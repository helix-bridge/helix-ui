import { isEqual } from 'lodash';
import { BRIDGES } from '../../config/bridge';
import { Arrival, Bridge, BridgeConfig, ContractConfig, Departure } from '../../model';

const isPro = process.env.NODE_ENV === 'production';

export const NETWORK_GRAPH = new Map(
  BRIDGES.reduce((acc: [Departure, Arrival[]][], bridge: Bridge<BridgeConfig<ContractConfig>>) => {
    if (isPro && !bridge.stable) {
      return acc;
    }

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
  }, [])
);
