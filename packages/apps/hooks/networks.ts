import { ChainConfig } from 'shared/model';
import { CROSS_CHAIN_NETWORKS } from 'shared/utils';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from './api';

type NetworkFilter = (network: ChainConfig) => boolean;

const omitTestChain: NetworkFilter = (net) => !net.isTest;

const getGlobalFilters = (isTestDisplay: boolean) => (isTestDisplay ? [] : [omitTestChain]);

export function useNetworks() {
  const { enableTestNetworks } = useApi();
  const [fromFilters, setFromFilters] = useState<NetworkFilter[]>([]);
  const [fromNetworks, setFromNetworks] = useState<ChainConfig[]>(CROSS_CHAIN_NETWORKS);
  const [toFilters, setToFilters] = useState<NetworkFilter[]>([]);
  const [toNetworks, setToNetworks] = useState<ChainConfig[]>(CROSS_CHAIN_NETWORKS);

  const getNetworks = useCallback(
    (filters: NetworkFilter[]) => {
      return [...getGlobalFilters(enableTestNetworks), ...filters].reduce(
        (networks, predicateFn) => networks.filter((network) => predicateFn(network)),
        CROSS_CHAIN_NETWORKS
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
