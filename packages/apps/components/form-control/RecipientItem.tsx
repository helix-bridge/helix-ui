import { AutoComplete, Form, Input } from 'antd';
import { upperFirst } from 'lodash';
import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IdentAccountAddress } from 'shared/components/widget/IdentAccountAddress';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossChainComponentProps, CrossChainParty, IAccountMeta, PolkadotChainConfig } from 'shared/model';
import { convertToSS58, isPolkadotNetwork, isSameAddress, isValidAddressStrict, patchUrl } from 'shared/utils';
import { FormItemExtra } from './FormItemExtra';

// eslint-disable-next-line complexity
export function RecipientItem({
  form,
  extraTip,
  direction,
  accounts,
  onChange,
  isDvm = false,
}: Pick<CrossChainComponentProps<CrossChainParty>, 'form' | 'direction'> & {
  extraTip?: string | ReactNode;
  isDvm?: boolean;
  accounts?: IAccountMeta[];
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();

  const formattedAccounts = useMemo(
    () =>
      accounts?.map((item) => ({
        ...item,
        address: convertToSS58(item.address, (direction.to.meta as PolkadotChainConfig).ss58Prefix),
      })),
    [accounts, direction.to]
  );

  const { to } = direction;
  const isPolkadot = isPolkadotNetwork(to.meta);
  const type = isPolkadot ? to.meta.name : 'ethereum';

  const isValidRecipient = useCallback(
    (value) => isValidAddressStrict(value, !isDvm ? type : 'ethereum'),
    [isDvm, type]
  );

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
              return isValidRecipient(value) ? Promise.resolve() : Promise.reject();
            },
            message: !isDvm
              ? t('Please enter a valid {{network}} address', { network: upperFirst(to.meta.name) })
              : t('Please fill in a {{network}} smart address which start with 0x', {
                  network: upperFirst(to.meta.name),
                }),
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
            size="large"
            placeholder={t('Type or select the recipient address')}
            onChange={(event) => {
              if (isValidRecipient(event.target.value) && onChange) {
                onChange(event.target.value);
              }
            }}
          />
        ) : (
          <AutoComplete
            placeholder={t('Type or select the recipient address')}
            size="large"
            className="flex-1"
            onChange={(account) => {
              if (isValidRecipient(account) && onChange) {
                onChange(account);
              }
            }}
          >
            {formattedAccounts.map((item) => (
              <AutoComplete.Option value={item.address} key={item.address}>
                <IdentAccountAddress account={item} />
              </AutoComplete.Option>
            ))}
          </AutoComplete>
        )}
      </Form.Item>
    </Form.Item>
  );
}
