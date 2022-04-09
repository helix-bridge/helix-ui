import { pickBy, uniq } from 'lodash';
import store from 'store';
import { ChainConfig, Network, StorageInfo } from '../../model';

export const STORAGE_KEY = 'wormhole';

export function updateStorage(data: Partial<StorageInfo>): void {
  const origin = store.get(STORAGE_KEY);

  store.set(STORAGE_KEY, { ...origin, ...data });
}

export function readStorage(): StorageInfo {
  return store.get(STORAGE_KEY) || {};
}

export function saveNetworkConfig(config: ChainConfig) {
  const { config: oConf } = readStorage();
  const nConf = { ...(oConf ?? {}), [config.name]: config };

  updateStorage({ config: nConf });
}

export function removeCustomChain(name: Network) {
  const { custom = [] } = readStorage();
  const res = custom.filter((item) => item !== name);

  updateStorage({ custom: res });
}

export function addCustomChain(name: Network) {
  const { custom = [] } = readStorage();
  custom.push(name);

  updateStorage({ custom: uniq(custom) });
}

export function getCustomNetworkConfig() {
  const { config = {}, custom = [] } = readStorage();

  return pickBy(config, (item) => custom.includes(item.name));
}
