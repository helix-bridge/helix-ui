import { typesBundleForPolkadotApps } from '@darwinia/types/mix';
import { JsonRpcProvider, Web3Provider, WebSocketProvider } from '@ethersproject/providers';
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api';
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
  abstract isWebsocketActive(provider: ApiPromise | WebSocketProvider): boolean;

  protected checkExist(url: string): ApiGuy<T> | null {
    const target = this.apiList.find((item) => item[url]);

    return target ?? null;
  }

  // eslint-disable-next-line complexity
  getInstance(url: string): T {
    const provider = url === 'ethereum' ? null : this.checkExist(url);

    if (provider && url.startsWith('wss')) {
      if (this.isWebsocketActive(provider[url] as unknown as ApiPromise | WebSocketProvider)) {
        return provider[url];
      } else {
        this.removeInstance(url);
      }
    }

    const instance = this.init(url);

    if (url.startsWith('wss')) {
      this.apiList.push({ [url]: instance });
    }

    this.afterInit(instance);

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
    let provider;

    if (url.startsWith('wss')) {
      provider = new WsProvider(url, SHORT_DURATION);
    }

    if (url.startsWith('https')) {
      provider = new HttpProvider(url);
    }

    return new ApiPromise({
      provider,
      typesBundle: typesBundleForPolkadotApps,
    });
  }

  isWebsocketActive(provider: ApiPromise) {
    return provider.isConnected;
  }

  afterInit(_: ApiPromise) {
    // instance.connect(); // comment it if api auto connect disabled
  }

  beforeRemove(instance: ApiPromise) {
    instance.disconnect();
  }
}

class Web3Entrance extends Entrance<JsonRpcProvider> {
  name = 'web3';

  apiList: ApiGuy<JsonRpcProvider>[] = [];

  defaultProvider = 'ethereum';

  init(url: string) {
    if (url.startsWith('wss')) {
      return new WebSocketProvider(url);
    }

    if (url.startsWith('https')) {
      return new JsonRpcProvider(url);
    }

    return new Web3Provider(window.ethereum);
  }

  isWebsocketActive(provider: WebSocketProvider): boolean {
    return provider.websocket.readyState === 1 || provider.websocket.readyState === 0;
  }

  get currentProvider() {
    return this.getInstance(this.defaultProvider);
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
