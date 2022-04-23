import { BN_ZERO } from '@polkadot/util';
import { Checkbox, Form, FormInstance } from 'antd';
import FormList from 'antd/lib/form/FormList';
import BN from 'bn.js';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from 'web3-utils';
import { FORM_CONTROL } from '../../config/constant';
import { AvailableBalance, CrossChainAsset, CustomFormControlProps, DarwiniaAsset, Network } from '../../model';
import {
  amountLessThanFeeRule,
  fromWei,
  getPrecisionByUnit,
  insufficientBalanceRule,
  invalidFeeRule,
  isRing,
  toWei,
} from '../../utils';
import { Balance } from './Balance';
import { MaxBalance } from './MaxBalance';

type AssetGroupValue = (CrossChainAsset<DarwiniaAsset> & { checked?: boolean; unit?: Unit })[];

export function AssetGroup({
  value,
  onChange,
  network,
  balances,
  fee,
  form,
}: CustomFormControlProps<AssetGroupValue> & {
  network: Network;
  fee: BN | null;
  balances: AvailableBalance[];
  form: FormInstance;
}) {
  const { t } = useTranslation();

  const triggerChange = useCallback(
    (val: AssetGroupValue[0], index: number, origin: AssetGroupValue = []) => {
      if (onChange) {
        const updated = [...origin];

        updated[index] = val;
        onChange(updated);
      }
    },
    [onChange]
  );

  const ringBalance = useMemo(() => (balances || []).find((item) => isRing(item.asset)), [balances]);

  const feeFormatted = useMemo(() => {
    return fromWei({ value: fee, unit: ringBalance?.token.decimal ?? 'gwei' });
  }, [fee, ringBalance]);

  const insufficient = useMemo(
    () => new BN(feeFormatted || 0).gt(new BN(ringBalance?.max || 0)),
    [feeFormatted, ringBalance?.max]
  );

  return (
    <FormList
      name={FORM_CONTROL.assets}
      initialValue={value}
      rules={[
        {
          validator() {
            return insufficient ? Promise.reject('The ring balance it not enough to cover the fee') : Promise.resolve();
          },
          message: t('The ring balance it not enough to cover the fee'),
        },
        {
          validator: (_, groupValue: AssetGroupValue) => {
            const noChecked = groupValue?.every((item) => !item.checked);

            return noChecked ? Promise.reject('You must select at least one of these assets') : Promise.resolve();
          },
          message: 'You must select at least one of these assets',
        },
      ]}
    >
      {(fields, _operations, { errors }) => (
        <>
          {/* eslint-disable-next-line complexity */}
          {fields?.map((field, index) => {
            const target = (value || [])[field.fieldKey];
            const balance = balances.find(
              (item) => target.asset && item.token.symbol.toLowerCase().includes(target.asset)
            );
            const unit = balance?.token.decimal || 'gwei';

            return (
              <div className="flex items-center" key={field.key + index}>
                <Form.Item name={[field.name, 'asset']} fieldKey={[field.fieldKey, 'asset']} className="w-20">
                  <Checkbox
                    disabled={insufficient}
                    checked={!insufficient && target.checked}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      if (!checked) {
                        form.resetFields([FORM_CONTROL.assets, field.name, 'asset']);
                      }

                      triggerChange({ ...target, checked }, index, value);
                    }}
                    className="uppercase flex flex-row-reverse"
                  >
                    {target.asset}
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  validateFirst
                  name={[field.name, 'amount']}
                  fieldKey={[field.fieldKey, 'amount']}
                  className="flex-1 ml-4"
                  rules={[
                    invalidFeeRule({ t, compared: fee }),
                    { required: !!target.checked, message: t('Transfer amount is required') },
                    !target.checked
                      ? {}
                      : amountLessThanFeeRule({
                          t,
                          token: balance?.token,
                          compared: fee ?? 0,
                          asset: String(balance?.asset),
                        }),
                    insufficientBalanceRule({
                      t,
                      token: balance?.token,
                      compared: balance?.max ?? '0',
                    }),
                  ]}
                >
                  <Balance
                    disabled={!target.checked || insufficient}
                    placeholder={t('Available Balance {{balance}}', {
                      balance: balance?.max ? fromWei({ value: balance.max, unit }) : t('Querying'),
                    })}
                    onChange={(amount) => {
                      triggerChange({ ...target, amount }, index, value);
                    }}
                    step={100}
                    precision={getPrecisionByUnit(unit)}
                    className="flex-1"
                    size="large"
                  >
                    <MaxBalance
                      disabled={!target.checked || insufficient}
                      network={network}
                      size="large"
                      onClick={() => {
                        const keep = isRing(balance?.asset)
                          ? new BN(toWei({ value: 1, unit: balance?.token?.decimal ?? 'gwei' }))
                          : BN_ZERO;

                        const max = balance?.max ? new BN(balance.max).sub(keep) : BN_ZERO;

                        const val = {
                          ...target,
                          amount: fromWei({ value: max, unit }),
                        };

                        triggerChange(val, index, value);
                        form.setFields([{ errors: [], name: [FORM_CONTROL.assets, field.name, 'amount'] }]);
                      }}
                    />
                  </Balance>
                </Form.Item>
              </div>
            );
          })}
          <Form.ErrorList errors={errors}></Form.ErrorList>
        </>
      )}
    </FormList>
  );
}
