import { Vertices, RecordComponentProps } from '@helix/shared/model';
import { getBridgeComponent, verticesToChainConfig } from '@helix/shared/utils';
import { Empty } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { omit } from 'lodash';
import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface RecordListProps {
  departure: Vertices;
  arrival: Vertices;
  sourceData: { count: number; list: Record<string, string | number | null | undefined>[] };
}

const getRecordComponent = getBridgeComponent('record');

export function RecordList({ departure, arrival, sourceData }: RecordListProps) {
  const { t } = useTranslation();

  const Record = useMemo(
    () =>
      getRecordComponent({
        from: verticesToChainConfig(departure),
        to: verticesToChainConfig(arrival),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as FunctionComponent<RecordComponentProps<any>>,
    [departure, arrival]
  );

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <ErrorBoundary>
      {sourceData.list.map((item, index) => (
        <Record
          record={{ ...item, meta: omit(sourceData, ['list', 'count']) }}
          departure={verticesToChainConfig(departure)}
          arrival={verticesToChainConfig(arrival)}
          key={item.tx || index}
        />
      ))}
      {!sourceData.count && <Empty description={t('No Data')} />}
    </ErrorBoundary>
  );
}
