import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider, Progress } from 'antd';
import { formatDistance, fromUnixTime } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function Timestamp({
  departureRecord,
  arrivalRecord,
}: {
  departureRecord: HelixHistoryRecord | null;
  arrivalRecord: HelixHistoryRecord | null;
}) {
  const { t } = useTranslation();
  return (
    <TransferDescription
      title={t('Timestamp')}
      tip={t('Date & time of cross-chain transaction inclusion, including length of time for confirmation.')}
    >
      {departureRecord && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {arrivalRecord?.result ? <ClockCircleOutlined /> : <Icon name="reload" />}

          <span>
            {formatDistance(fromUnixTime(departureRecord.startTime), new Date(new Date().toUTCString()), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </span>

          <span className="hidden md:inline-block">
            ({new Date(departureRecord.startTime * 1000).toLocaleString()})
          </span>

          <Divider type="vertical" orientation="center" />

          <Icon name="clock-fill" className="text-gray-400 text-base" />

          {departureRecord.startTime && departureRecord.endTime ? (
            <span className="text-gray-400">
              {t('Confirmed within {{des}}', {
                des: formatDistance(fromUnixTime(departureRecord.endTime), fromUnixTime(departureRecord.startTime), {
                  includeSeconds: true,
                }),
              })}
            </span>
          ) : (
            <div className="w-32">
              <Progress
                strokeColor={{
                  from: '#108ee9',
                  to: '#87d068',
                }}
                percent={99.9}
                status="active"
                showInfo={false}
              />
            </div>
          )}
        </div>
      )}
    </TransferDescription>
  );
}
