import { ChainConfig } from 'shared/model';
import { chainConfigs } from 'shared/utils';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../providers';

type NetworkFilter = (network: ChainConfig) => boolean;

const omitTestChain: NetworkFilter = (net) => !net.isTest;

const getGlobalFilters = (isTestDisplay: boolean) => (isTestDisplay ? [] : [omitTestChain]);

export function useNetworks() {
  const { enableTestNetworks } = useApi();
  const [fromFilters, setFromFilters] = useState<NetworkFilter[]>([]);
  const [fromNetworks, setFromNetworks] = useState<ChainConfig[]>(chainConfigs);
  const [toFilters, setToFilters] = useState<NetworkFilter[]>([]);
  const [toNetworks, setToNetworks] = useState<ChainConfig[]>(chainConfigs);

  const getNetworks = useCallback(
    (filters: NetworkFilter[]) => {
      return [...getGlobalFilters(enableTestNetworks), ...filters].reduce(
        (networks, predicateFn) => networks.filter((network) => predicateFn(network)),
        chainConfigs
      );
    },
    [enableTestNetworks]
  );

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
