import { Empty } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { omit } from 'lodash';
import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordComponentProps, Vertices } from 'shared/model';
import { getBridgeComponent } from 'shared/utils/bridge';
import { getChainConfig } from 'shared/utils/network';

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        from: getChainConfig(departure),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        to: getChainConfig(arrival),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as FunctionComponent<RecordComponentProps<any>>,
    [departure, arrival]
  );

  return (
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
