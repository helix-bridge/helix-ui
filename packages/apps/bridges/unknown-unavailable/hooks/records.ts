import { useCallback } from 'react';
import { ChainConfig, RecordsHooksResult, RecordList } from '../../../model';

export function useRecords(departure: ChainConfig, arrival: ChainConfig): RecordsHooksResult<RecordList<unknown>> {
  const fetchIssuingRecords = useCallback(() => {}, []);
  const fetchRedeemRecords = useCallback(() => {}, []);

  return {
    fetchRedeemRecords,
    fetchIssuingRecords,
  };
}
