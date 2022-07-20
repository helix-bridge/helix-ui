import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider, Progress } from 'antd';
import { format, formatDistance, fromUnixTime } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { DATE_TIME_FORMAT } from 'shared/config/constant';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function Timestamp({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Timestamp')}
      tip={t('Date & time of cross-chain transaction inclusion, including length of time for confirmation.')}
    >
      {record && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {record.result ? <ClockCircleOutlined /> : <Icon name="reload" />}

          <span>
            {formatDistance(fromUnixTime(record.startTime), new Date(new Date().toUTCString()), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </span>

          <span className="hidden md:inline-block">
            ({format(new Date(new Date(record.startTime * 1000).toUTCString()), DATE_TIME_FORMAT)})
          </span>

          <Divider type="vertical" orientation="center" />

          <Icon name="clock-fill" className="text-gray-400 text-base" />

          {record.startTime && record.endTime ? (
            <span className="text-gray-400">
              {t('Confirmed within {{des}}', {
                des: formatDistance(fromUnixTime(record.endTime), fromUnixTime(record.startTime), {
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
