import { useCallback, useEffect, useState } from 'react';
import { ChainConfig } from 'shared/model';
import { chainConfigs } from 'shared/utils/network';

type NetworkFilter = (network: ChainConfig) => boolean;

export function useNetworks() {
  const [fromFilters, setFromFilters] = useState<NetworkFilter[]>([]);
  const [fromNetworks, setFromNetworks] = useState<ChainConfig[]>(chainConfigs);
  const [toFilters, setToFilters] = useState<NetworkFilter[]>([]);
  const [toNetworks, setToNetworks] = useState<ChainConfig[]>(chainConfigs);

  const getNetworks = useCallback((filters: NetworkFilter[]) => {
    return filters.reduce((networks, predicateFn) => networks.filter((network) => predicateFn(network)), chainConfigs);
  }, []);

  useEffect(() => {
    const from = getNetworks(fromFilters);

    setFromNetworks(from);
  }, [fromFilters, getNetworks]);

  useEffect(() => {
    const to = getNetworks(toFilters);

    setToNetworks(to);
  }, [getNetworks, toFilters]);

  return {
    fromNetworks,
    toNetworks,
    setFromFilters,
    setToFilters,
  };
}
