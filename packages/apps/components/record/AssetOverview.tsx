import { DATE_FORMAT } from '@helix/shared/config/constant';
import { fromWei, getTimeRange, prettyNumber } from '@helix/shared/utils';
import { Typography } from 'antd';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export interface AssetOverviewProps {
  amount: string;
  decimals?: number;
  deposit?: { start: number; month: number; deposit_id: string };
  currency: string;
}

export function AssetOverview({ amount, deposit, currency, decimals = 18 }: AssetOverviewProps) {
  const { t } = useTranslation();
  const depositFlag = 'DEPOSIT';

  if (!currency || !amount) {
    return null;
  }

  if (currency.toUpperCase() === depositFlag) {
    const { deposit_id, start, month } = deposit!;
    const { start: startTime, end: endTime } = getTimeRange(start, month);

    return (
      <Typography.Text>
        <span>{deposit_id}</span>
        <p>
          {fromWei({ value: amount }, prettyNumber)} RING ({t('Time')}: {format(startTime, DATE_FORMAT)} -{' '}
          {format(endTime, DATE_FORMAT)})
        </p>
      </Typography.Text>
    );
  }

  return (
    <Typography.Text className="mr-4">
      <span className="mr-2">
        {amount.includes('.')
          ? amount
          : fromWei({ value: amount, decimals }, (value) => prettyNumber(value, { decimal: 9 }))}
      </span>
      <span>{currency}</span>
    </Typography.Text>
  );
}
