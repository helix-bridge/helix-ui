import { EvoApiPath } from '@helix/shared/config/api';
import { FORM_CONTROL } from '@helix/shared/config/constant';
import { CrossChainDirection, CustomFormControlProps } from '@helix/shared/model';
import { getBridge, apiUrl, getTimeRange, empty } from '@helix/shared/utils';
import { Form, Progress, Select } from 'antd';
import { Rule } from 'antd/lib/form';
import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecordsQuery } from '../../hooks';
import { Deposit, DepositResponse, EthereumDarwiniaBridgeConfig } from './model';

interface DepositItemProps {
  address: string;
  direction: CrossChainDirection;
  removedIds: number[];
  rules?: Rule[];
}

// eslint-disable-next-line complexity
export function DepositItem({
  address,
  direction,
  onChange = empty,
  value,
  removedIds = [],
  rules = [],
}: CustomFormControlProps<Deposit | null> & DepositItemProps) {
  const { t } = useTranslation();
  const url = useMemo(() => {
    const bridge = getBridge<EthereumDarwiniaBridgeConfig>(direction);

    return bridge.config.api.evolution;
  }, [direction]);
  const { data, error, loading } = useRecordsQuery<DepositResponse>({
    url: apiUrl(url, EvoApiPath.deposit),
    params: { address },
    // url: apiUrl('https://www.evolution.land', EvoApiPath.deposit),
    // params: { address: '0xf916a4ef2de14a9d8aab6d29d122a641ecde2b28' }, // test account;
  });
  const triggerChange = useCallback(
    (id) => {
      onChange(data?.list.find((item) => item.deposit_id === +id) ?? null);
    },
    [data?.list, onChange]
  );

  if (loading) {
    return (
      <Form.Item name={FORM_CONTROL.deposit} label={t('Deposit')} rules={[{ required: true }]}>
        <Progress percent={99} status="active" strokeColor={{ from: '#5745de', to: '#ec3783' }} />
      </Form.Item>
    );
  }

  if (!data || error) {
    return (
      <Form.Item name={FORM_CONTROL.deposit} label={t('Deposit')} rules={[{ required: true }]}>
        <Select disabled size="large" value={t('Search deposit failed')} className="text-center"></Select>
      </Form.Item>
    );
  }

  if (!data || !data.list.length) {
    return (
      <Form.Item name={FORM_CONTROL.deposit} label={t('Deposit')} rules={[{ required: true }]}>
        <Select disabled size="large" value={t('No Deposits')} className="text-center"></Select>
      </Form.Item>
    );
  }

  return (
    <Form.Item name={FORM_CONTROL.deposit} label={t('Deposit')} rules={[{ required: true }, ...rules]}>
      <Select
        placeholder={t('Please select deposit')}
        value={value?.deposit_id}
        onChange={(id) => triggerChange(id)}
        size="large"
      >
        {data.list
          .filter((item) => !removedIds.includes(item.deposit_id))
          .map((item) => {
            const { deposit_id, amount } = item;
            const { start, end } = getTimeRange(item.deposit_time, item.duration);
            const DATE_FORMAT = 'yyyy/MM/dd';

            return (
              <Select.Option key={deposit_id} value={deposit_id}>
                <span>
                  {amount} RING
                  <span>
                    ({t('Deposit ID')}: {deposit_id} {t('Time')}: {format(start, DATE_FORMAT)} -{' '}
                    {format(end, DATE_FORMAT)})
                  </span>
                </span>
              </Select.Option>
            );
          })}
      </Select>
    </Form.Item>
  );
}
