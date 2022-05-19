import { Empty } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import { omit } from 'lodash';
import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordComponentProps, Vertices } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { getChainConfig } from 'shared/utils/network';

interface RecordListProps {
  departure: Vertices;
  arrival: Vertices;
  sourceData: { count: number; list: Record<string, string | number | null | undefined>[] };
}

export function RecordList({ departure, arrival, sourceData }: RecordListProps) {
  const { t } = useTranslation();

  const Record = useMemo(() => {
    const bridge = getBridge([departure, arrival]);

    return (
      bridge.isIssuing(departure, arrival) ? bridge.IssuingRecordComponent : bridge.RedeemRecordComponent
    ) as FunctionComponent<RecordComponentProps<unknown>>;
  }, [arrival, departure]);

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
