import { useManualQuery } from 'graphql-hooks';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { MIDDLE_DURATION, RecordStatus } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { HelixHistoryRecord } from 'shared/model';
import { gqlName } from 'shared/utils/helper/common';
import { pollWhile } from 'shared/utils/helper/operator';
import { HISTORY_RECORD_BY_ID } from '../config';

export function useUpdatableRecord(id: string) {
  const [record, setRecord] = useState<HelixHistoryRecord | null>(null);
  const isMounted = useIsMounted();
  const [request] = useManualQuery(HISTORY_RECORD_BY_ID, { variables: { id } });

  useEffect(() => {
    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(request())),
        map(({ data }) => data[gqlName(HISTORY_RECORD_BY_ID)]),
        pollWhile<HelixHistoryRecord>(
          MIDDLE_DURATION,
          (res) => isMounted && ![RecordStatus.success, RecordStatus.refunded].includes(res.result),
          100
        ),
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