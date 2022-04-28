import { Vertices, RecordComponentProps } from 'shared/model';
import { getBridgeComponent, getChainConfig } from 'shared/utils';
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
        from: getChainConfig(departure),
        to: getChainConfig(arrival),
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
          departure={getChainConfig(departure)}
          arrival={getChainConfig(arrival)}
          key={item.tx || index}
        />
      ))}
      {!sourceData.count && <Empty description={t('No Data')} />}
    </ErrorBoundary>
  );
}
