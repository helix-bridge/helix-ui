import { isNull, omitBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { Departure } from 'shared/model';
import {
  isEthereum2Darwinia,
  isDarwinia2Ethereum,
  isSubstrate2SubstrateDVM,
  isSubstrateDVM2Substrate,
  isSubstrate2DVM,
  isDVM2Substrate,
} from 'shared/utils/bridge';
import { RecordsQueryRequest, rxGet } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { useRecords as useDarwiniaEthereum } from '../bridges/ethereum-darwinia/hooks';
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
  const [depConfig, arrConfig] = [getChainConfig(departure), getChainConfig(arrival)];

  const darwiniaEthereum = useDarwiniaEthereum();
  const substrateSubstrateDVM = useSubstrateSubstrateDVM(depConfig, arrConfig);
  const substrateDVM = useSubstrateDVM(depConfig, arrConfig);

  const genParams = useCallback((params: RecordRequestParams) => {
    const req = omitBy<RecordRequestParams>(params, isNull) as RecordRequestParams;

    return req;
  }, []);

  const genQueryFn = useCallback<() => (req: RecordRequestParams) => Observable<unknown>>(
    // eslint-disable-next-line complexity
    () => {
      if (isEthereum2Darwinia(departure, arrival)) {
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
      darwiniaEthereum.fetchRedeemRecords,
      darwiniaEthereum.fetchIssuingRecords,
      substrateSubstrateDVM.fetchIssuingRecords,
      substrateSubstrateDVM.fetchRedeemRecords,
      substrateDVM.fetchIssuingRecords,
      substrateDVM.fetchRedeemRecords,
    ]
  );

  const queryRecords = useCallback(
    (params: RecordRequestParams) => {
      const { direction, address } = params;

      if (!direction || !address) {
        return EMPTY;
      }

      const req = genParams(params);
      const fn = genQueryFn();

      return fn(req);
    },
    [genParams, genQueryFn]
  );

  return { queryRecords };
}
