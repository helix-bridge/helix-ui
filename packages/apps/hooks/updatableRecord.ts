import request from 'graphql-request';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';
import { distinctUntilChanged, from, map, of, switchMap } from 'rxjs';
import { MIDDLE_DURATION, RecordStatus } from 'shared/config/constant';
import { ENDPOINT } from 'shared/config/env';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord } from 'shared/model';
import { gqlName, pollWhile } from 'shared/utils/helper';
import { HISTORY_RECORD_BY_ID } from '../config';

export function useUpdatableRecord(id: string) {
  const [record, setRecord] = useState<HelixHistoryRecord | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(request(ENDPOINT, HISTORY_RECORD_BY_ID, { id }))),
        map((res) => res[gqlName(HISTORY_RECORD_BY_ID)]),
        pollWhile<HelixHistoryRecord>(MIDDLE_DURATION, (res) => isMounted && res.result === RecordStatus.pending, 100),
        distinctUntilChanged((pre, cur) => isEqual(pre, cur))
      )
      .subscribe({
        next(result) {
          if (result) {
            setRecord(result);
          }
        },
        error(error: Error) {
          console.warn('🚨 ~ s2s detail polling exceed maximum limit  ', error.message);
        },
      });

    return () => sub$$?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { record };
}
