import { Form, FormInstance, Select } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from 'web3-utils';
import { FORM_CONTROL } from '../../config/constant';
import { useApi } from '../../hooks';
import { AvailableBalance } from '../../model';
import { fromWei, prettyNumber } from '../../utils';
import { IdentAccountAddress } from '../widget/IdentAccountAddress';
import { FormItemExtra } from './FormItemExtra';

interface PolkadotAccountsProps {
  onChange?: (acc: string) => void;
  availableBalances: AvailableBalance[];
  form?: FormInstance;
}

export function PolkadotAccountsItem({ onChange, availableBalances, form }: PolkadotAccountsProps) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts },
  } = useApi();

  useEffect(() => {
    if (form && onChange) {
      const value = form.getFieldValue([FORM_CONTROL.sender]);

      onChange(value); // If reconnect happen, restore the parent component state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form.Item
      name={FORM_CONTROL.sender}
      label={t('Sender Account')}
      rules={[{ required: true }]}
      extra={
        <FormItemExtra>
          {t('Balance ')}
          <span className="ml-2">
            {availableBalances.length
              ? availableBalances.map(({ asset, max, token }, index) => (
                  <span key={asset || index} className="mr-2">
                    {fromWei({ value: max, unit: (token.decimal as Unit) || 'gwei' }, prettyNumber)} {token.symbol}
                  </span>
                ))
              : '-'}
          </span>
        </FormItemExtra>
      }
    >
      <Select
        size="large"
        onChange={(addr: string) => {
          if (onChange) {
            onChange(addr);
          }
        }}
        placeholder={t('Select the sender account')}
      >
        {(accounts ?? []).map((item) => (
          <Select.Option value={item.address} key={item.address}>
            <IdentAccountAddress account={item} iconSize={24} />
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
