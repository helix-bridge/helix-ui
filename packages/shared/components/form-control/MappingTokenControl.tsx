import { Loading3QuartersOutlined } from '@ant-design/icons';
import { Progress, Select, Typography } from 'antd';
import { groupBy } from 'lodash';
import { PropsWithRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterStatus } from '../../config/constant';
import { MemoedTokenInfo } from '../../hooks';
import { CustomFormControlProps, MappingToken } from '../../model';
import { fromWei, getUnit, prettyNumber } from '../../utils';
import { EllipsisMiddle } from '../widget/EllipsisMiddle';
import { MappingTokenInfo } from '../widget/MappingTokenInfo';

interface MappingTokenControlProps extends CustomFormControlProps<MappingToken | null> {
  tokens: MemoedTokenInfo[];
  total: number;
}

// eslint-disable-next-line complexity
export function MappingTokenControl({ value, onChange, tokens, total }: PropsWithRef<MappingTokenControlProps>) {
  const { t } = useTranslation();
  const data = useMemo(() => groupBy(tokens, (token) => RegisterStatus[token.status ?? 0]), [tokens]);
  const triggerChange = useCallback(
    (val: string) => {
      if (onChange) {
        const result = tokens.find((item) => item.address === val) ?? null;

        onChange(result as MappingToken);
      }
    },
    [tokens, onChange]
  );
  const option = useCallback(
    (token: MappingToken, disabled = false) => (
      <Select.Option
        value={token.address}
        key={token.address}
        disabled={disabled}
        label={
          <EllipsisMiddle>
            {token.symbol} - {token.address}
          </EllipsisMiddle>
        }
      >
        <div className="flex justify-between items-center pr-3">
          <MappingTokenInfo token={token}></MappingTokenInfo>
          {token.status === 1 ? (
            <span>{fromWei({ value: token.balance, unit: getUnit(+token.decimals) }, prettyNumber)}</span>
          ) : (
            <Loading3QuartersOutlined className="text-red-500" />
          )}
        </div>
      </Select.Option>
    ),
    []
  );
  const percent = total && (tokens.length / total) * 100;
  const inprogress = data[RegisterStatus[RegisterStatus.registering]] ?? [];
  const confirmed = data[RegisterStatus[RegisterStatus.registered]] ?? [];

  return (
    <>
      <Select<string>
        size="large"
        showSearch
        allowClear
        value={value?.address}
        placeholder={t('Search name or paste address')}
        onChange={(val: string) => {
          triggerChange(val);
        }}
        optionLabelProp="label"
      >
        <Select.OptGroup label={<Typography.Title level={5}>{t('Available')}</Typography.Title>}>
          {!confirmed.length ? (
            <Select.Option key="confirmedEmpty" value="confirmed" disabled className="text-center">
              {t('No Data')}
            </Select.Option>
          ) : (
            confirmed.map((token) => option(token as MappingToken))
          )}
        </Select.OptGroup>

        <Select.OptGroup label={<Typography.Title level={5}>{t('In progress')}</Typography.Title>}>
          {!inprogress.length ? (
            <Select.Option key="inprogressEmpty" value="inprogress" disabled className="text-center">
              {t('No Data')}
            </Select.Option>
          ) : (
            inprogress.map((token) => option(token as MappingToken, true))
          )}
        </Select.OptGroup>
      </Select>
      {percent >= 0 && percent < 100 && (
        <Progress percent={percent} status="active" strokeColor={{ from: '#5745de', to: '#ec3783' }} />
      )}
    </>
  );
}
