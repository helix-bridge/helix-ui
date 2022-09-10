import type { TypeRegistry } from '@polkadot/types/create/registry';
import type { ApiPromise } from '@polkadot/api';

let ITypeRegistry: typeof TypeRegistry;

export async function typeRegistryFactory() {
  if (!ITypeRegistry) {
    const { TypeRegistry } = await import('@polkadot/types/create/registry');

    ITypeRegistry = TypeRegistry;
  }

  return ITypeRegistry;
}

let IApiPromise: typeof ApiPromise;

export async function apiPromiseFactory() {
  if (!IApiPromise) {
    const { ApiPromise } = await import('@polkadot/api/promise');

    IApiPromise = ApiPromise;
  }

  return IApiPromise;
}
