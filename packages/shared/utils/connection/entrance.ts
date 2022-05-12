import { typesBundleForPolkadotApps } from '@darwinia/types/mix';
import { ApiPromise, WsProvider } from '@polkadot/api';
import Web3 from 'web3';
import { SHORT_DURATION } from '../../config/constant';

interface ApiGuy<T> {
  [key: string]: T;
}

abstract class Entrance<T> {
  abstract readonly name: string;
  abstract apiList: ApiGuy<T>[];
  abstract beforeRemove(instance: T): void;
  abstract init(url: string): T;
  abstract afterInit(instance: T): void;

  protected checkExist(url: string): ApiGuy<T> | null {
    const target = this.apiList.find((item) => item[url]);

    return target ?? null;
  }

  getInstance(url: string): T {
    const exist = this.checkExist(url);

    if (exist) {
      return exist[url];
    }

    const instance = this.init(url);

    this.apiList.push({ [url]: instance });
    this.afterInit(instance);

    console.log(`🌎 ~ ${this.name} api list`, this.apiList.map((item) => Object.keys(item)).flat());
    return instance;
  }

  removeInstance(url: string): void {
    const exist = this.checkExist(url);

    if (exist) {
      this.beforeRemove(exist[url]);
      this.apiList = this.apiList.filter((item) => item !== exist);
    }
  }
}

class PolkadotEntrance extends Entrance<ApiPromise> {
  name = 'polkadot';

  apiList: ApiGuy<ApiPromise>[] = [];

  init(url: string) {
    const provider = new WsProvider(url, SHORT_DURATION);

    return new ApiPromise({
      provider,
      typesBundle: typesBundleForPolkadotApps,
    });
  }

  afterInit(_: ApiPromise) {
    // instance.connect(); // comment it if api auto connect disabled
  }

  beforeRemove(instance: ApiPromise) {
    instance.disconnect();
  }
}

class Web3Entrance extends Entrance<Web3> {
  name = 'web3';

  apiList: ApiGuy<Web3>[] = [];

  defaultProvider = 'ethereum';

  init(url: string) {
    if (url === this.defaultProvider) {
      return new Web3(window.ethereum);
    }

    const provider = new Web3.providers.WebsocketProvider(url, {
      clientConfig: {
        keepalive: true,
        keepaliveInterval: 60000,
      },
      reconnect: {
        auto: true,
        delay: 2500,
        onTimeout: true,
      },
    });

    return new Web3(provider);
  }

  afterInit() {
    // nothing to do
  }

  beforeRemove() {
    // nothing to do
  }
}

/**
 * Hold a singleton entrance in apps scope.
 * The entrance guarantees the instance will not be instantiated repeatedly.
 */
export const entrance = (() => {
  let polkadot: PolkadotEntrance;
  let web3: Web3Entrance;

  return {
    get polkadot() {
      if (polkadot) {
        return polkadot;
      }

      polkadot = new PolkadotEntrance();

      return polkadot;
    },
    get web3() {
      if (web3) {
        return web3;
      }

      web3 = new Web3Entrance();

      return web3;
    },
  };
})();
