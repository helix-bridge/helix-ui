import { ClockCircleOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { formatDistance, fromUnixTime } from 'date-fns';
import format from 'date-fns/formatRFC7231';
import { useTranslation } from 'next-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { HelixHistoryRecord } from 'shared/model';
import { TransferDescription } from './TransferDescription';

export function Timestamp({ record }: { record: HelixHistoryRecord | null }) {
  const { t } = useTranslation();

  return (
    <TransferDescription
      title={t('Timestamp')}
      tip={t(
        'The date and time at which a transaction is mined. And the time period elapsed for the completion of the cross-chain.'
      )}
    >
      {record && (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {record.result ? <ClockCircleOutlined /> : <Icon name="reload" className="w-4 h-4" />}

          {formatDistance(fromUnixTime(record.startTime), new Date(new Date().toUTCString()), {
            includeSeconds: true,
            addSuffix: true,
          })}

          <span className="hidden md:inline-block">({format(fromUnixTime(record.startTime))})</span>

          {record.startTime && !!record.endTime && (
            <>
              <Divider type="vertical" orientation="center" />

              <Icon name="clock-fill" className="text-gray-400 text-base w-4 h-4" />

              <span className="text-gray-400">
                {t('Confirmed within {{des}}', {
                  des: formatDistance(fromUnixTime(record.endTime), fromUnixTime(record.startTime), {
                    includeSeconds: true,
                  }),
                })}
              </span>
            </>
          )}
        </div>
      )}
    </TransferDescription>
  );
}
