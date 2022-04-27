import { LockOutlined } from '@ant-design/icons';
import { IdentAccountAddress } from 'shared/components/widget/IdentAccountAddress';
import { FORM_CONTROL } from 'shared/config/constant';
import {
  CrossChainComponentProps,
  CrossChainParty,
  CrossChainPayload,
  IAccountMeta,
  PolkadotChainConfig,
} from 'shared/model';
import { convertToSS58, isPolkadotNetwork, isSameAddress, isValidAddressStrict, patchUrl } from 'shared/utils';
import { AutoComplete, Form, FormInstance, Input } from 'antd';
import { upperFirst } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLock } from '../../hooks';
import { FormItemExtra } from './FormItemExtra';

// eslint-disable-next-line complexity
export function RecipientItem({
  form,
  extraTip,
  direction,
  accounts,
  isDvm = false,
}: Omit<CrossChainComponentProps<CrossChainParty>, 'setSubmit' | 'setBridgeState'> & {
  extraTip?: string | ReactNode;
  isDvm?: boolean;
  accounts?: IAccountMeta[];
}) {
  const { t } = useTranslation();
  const [lock] = useLock(form as FormInstance<CrossChainPayload<CrossChainParty>>);

  const formattedAccounts = useMemo(
    () =>
      accounts?.map((item) => ({
        ...item,
        address: convertToSS58(item.address, (direction.to as PolkadotChainConfig).ss58Prefix),
      })),
    [accounts, direction.to]
  );

  const { to } = direction;
  const isPolkadot = isPolkadotNetwork(to);
  const type = isPolkadot ? to.name : 'ethereum';

  return (
    <Form.Item className="mb-0">
      <Form.Item
        label={t('Recipient')}
        name={FORM_CONTROL.recipient}
        validateFirst
        validateTrigger="onBlur"
        rules={[
          { required: true },
          {
            validator(_, value) {
              return isDvm || !isSameAddress(form.getFieldValue(FORM_CONTROL.sender), value)
                ? Promise.resolve()
                : Promise.reject();
            },
            message: t('The sending address and the receiving address cannot be the same'),
          },
          {
            validator(_, value) {
              return isValidAddressStrict(value, !isDvm ? type : 'ethereum') ? Promise.resolve() : Promise.reject();
            },
            message: !isDvm
              ? t('Please enter a valid {{network}} address', { network: upperFirst(to.name) })
              : t('Please fill in a {{network}} smart address which start with 0x', { network: upperFirst(to?.name) }),
          },
        ]}
        extra={to ? <FormItemExtra>{extraTip}</FormItemExtra> : ''}
        className="mb-2"
      >
        {isDvm || !formattedAccounts?.length ? (
          <Input
            onBlur={(event) => {
              patchUrl({ recipient: event.target.value });
            }}
            disabled={lock}
            suffix={lock && <LockOutlined />}
            size="large"
            placeholder={t('Type or select the recipient address')}
          />
        ) : (
          <AutoComplete
            disabled={lock}
            placeholder={t('Type or select the recipient address')}
            size="large"
            className="flex-1"
          >
            {formattedAccounts.map((item) => (
              <AutoComplete.Option value={item.address} key={item.address}>
                <IdentAccountAddress account={item} />
              </AutoComplete.Option>
            ))}
          </AutoComplete>
        )}
      </Form.Item>
      {lock && <span className="text-gray-300">{t('You must select the destination network to unlock')}</span>}
    </Form.Item>
  );
}
