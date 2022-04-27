import { Departure } from 'shared/model';
import {
  RecordsQueryRequest,
  rxGet,
  verticesToChainConfig,
  isTronNetwork,
  isEthereum2Darwinia,
  isDarwinia2Ethereum,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate,
  isEthereum2DVM,
  isDVM2Ethereum,
  isSubstrate2DVM,
  isDVM2Substrate,
} from 'shared/utils';
import { isNull, omitBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { useRecords as useDarwiniaEthereum } from '../bridges/ethereum-darwinia/hooks';
import { useRecords as useEthereumDarwiniaDVM } from '../bridges/ethereum-darwiniaDVM/hooks';
import { useRecords as useSubstrateDVM } from '../bridges/substrate-dvm/hooks';
import { useRecords as useSubstrateSubstrateDVM } from '../bridges/substrate-substrateDVM/hooks';
import { RecordRequestParams } from '../model';

interface RecordsHook<T> {
  loading: boolean;
  error?: Record<string, unknown> | null;
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetch?: (...args: any) => Subscription;
}

export function useRecordsQuery<T = unknown>(req: RecordsQueryRequest): RecordsHook<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Record<string, unknown> | null>(null);
  const [data, setData] = useState<T | null>(null);

  const query = useCallback((request: RecordsQueryRequest) => {
    setLoading(true);

    return rxGet<T>(request).subscribe({
      next: (res) => {
        setData(res);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      },
      complete: () => {
        setLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    const sub$$ = query(req);

    return () => {
      sub$$.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    data,
    error,
    refetch: query,
  };
}

export function useRecords(departure: Departure, arrival: Departure) {
  const [depConfig, arrConfig] = [verticesToChainConfig(departure), verticesToChainConfig(arrival)];

  const darwiniaEthereum = useDarwiniaEthereum(depConfig, arrConfig);
  const ethereumDarwiniaDVM = useEthereumDarwiniaDVM(depConfig, arrConfig);
  const substrateSubstrateDVM = useSubstrateSubstrateDVM(depConfig, arrConfig);
  const substrateDVM = useSubstrateDVM(depConfig, arrConfig);

  const genParams = useCallback((params: RecordRequestParams) => {
    const req = omitBy<RecordRequestParams>(params, isNull) as RecordRequestParams;
    const [dep] = params.direction;

    if (isTronNetwork(dep)) {
      return { ...req, address: window.tronWeb ? window.tronWeb.address.toHex(params.address) : '' };
    }

    return req;
  }, []);

  const genQueryFn = useCallback<(isGenesis: boolean) => (req: RecordRequestParams) => Observable<unknown>>(
    // eslint-disable-next-line complexity
    (isGenesis = false) => {
      if (isTronNetwork(departure) || (isEthereum2Darwinia(departure, arrival) && isGenesis)) {
        return darwiniaEthereum.fetchGenesisRecords;
      }

      if (isEthereum2Darwinia(departure, arrival) && !isGenesis) {
        return darwiniaEthereum.fetchRedeemRecords;
      }

      if (isDarwinia2Ethereum(departure, arrival)) {
        return darwiniaEthereum.fetchIssuingRecords;
      }

      if (isSubstrate2SubstrateDVM(departure, arrival)) {
        return substrateSubstrateDVM.fetchIssuingRecords;
      }

      if (isSubstrateDVM2Substrate(departure, arrival)) {
        return substrateSubstrateDVM.fetchRedeemRecords;
      }

      if (isEthereum2DVM(departure, arrival)) {
        return ethereumDarwiniaDVM.fetchRedeemRecords;
      }

      if (isDVM2Ethereum(departure, arrival)) {
        return ethereumDarwiniaDVM.fetchIssuingRecords;
      }

      if (isSubstrate2DVM(departure, arrival)) {
        return substrateDVM.fetchIssuingRecords;
      }

      if (isDVM2Substrate(departure, arrival)) {
        return substrateDVM.fetchRedeemRecords;
      }

      return (_: RecordRequestParams) => EMPTY;
    },
    [
      departure,
      arrival,
      darwiniaEthereum.fetchGenesisRecords,
      darwiniaEthereum.fetchRedeemRecords,
      darwiniaEthereum.fetchIssuingRecords,
      substrateSubstrateDVM.fetchIssuingRecords,
      substrateSubstrateDVM.fetchRedeemRecords,
      ethereumDarwiniaDVM.fetchRedeemRecords,
      ethereumDarwiniaDVM.fetchIssuingRecords,
      substrateDVM.fetchIssuingRecords,
      substrateDVM.fetchRedeemRecords,
    ]
  );

  const queryRecords = useCallback(
    (params: RecordRequestParams, isGenesis: boolean) => {
      const { direction, address } = params;

      if (!direction || !address) {
        return EMPTY;
      }

      const req = genParams(params);
      const fn = genQueryFn(isGenesis);

      return fn(req);
    },
    [genParams, genQueryFn]
  );

  return { queryRecords };
}
