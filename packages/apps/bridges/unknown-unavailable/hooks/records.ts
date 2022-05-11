/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { ChainConfig } from 'shared/model';
import { RecordList, RecordsHooksResult } from '../../../model';

export function useRecords(_: ChainConfig, __: ChainConfig): RecordsHooksResult<RecordList<unknown>> {
  const fetchIssuingRecords = useCallback(() => {
    // nothing
  }, []) as unknown as any;
  const fetchRedeemRecords = useCallback(() => {
    // nothing
  }, []) as unknown as any;

  return {
    fetchRedeemRecords,
    fetchIssuingRecords,
  };
}
