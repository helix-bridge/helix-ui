import { ApiOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, Tooltip } from 'antd';
import { upperFirst } from 'lodash';
import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IdentAccountAddress } from 'shared/components/widget/IdentAccountAddress';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossChainComponentProps, CrossChainParty, PolkadotChainConfig } from 'shared/model';
import { convertToSS58, isPolkadotNetwork, isSameAddress, isValidAddressStrict, patchUrl } from 'shared/utils';
import { useApi } from '../../providers';
import { FormItemExtra } from './FormItemExtra';

// eslint-disable-next-line complexity
export function RecipientItem({
  form,
  extraTip,
  direction,
  onChange,
  bridge,
}: Pick<CrossChainComponentProps<CrossChainParty>, 'form' | 'direction' | 'bridge'> & {
  extraTip?: string | ReactNode;
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { assistantConnection, connectAssistantNetwork } = useApi();

  const formattedAccounts = useMemo(
    () =>
      assistantConnection.accounts?.map((item) => ({
        ...item,
        address: convertToSS58(item.address, (direction.to.meta as PolkadotChainConfig).ss58Prefix),
      })),
    [assistantConnection.accounts, direction.to.meta]
  );

  const { to } = direction;
  const isPolkadot = isPolkadotNetwork(to.meta) && to.meta.mode === 'native';
  const type = isPolkadot ? to.meta.name : 'ethereum';

  const isValidRecipient = useCallback((value: string) => isValidAddressStrict(value, type), [type]);

  return (
    <Form.Item
      label={t('Recipient')}
      name={FORM_CONTROL.recipient}
      validateFirst
      validateTrigger="onBlur"
      rules={[
        { required: true },
        {
          validator(_, value: string) {
            return type === 'ethereum' || !isSameAddress(form.getFieldValue(FORM_CONTROL.sender), value)
              ? Promise.resolve()
              : Promise.reject();
          },
          message: t('The sending address and the receiving address cannot be the same'),
        },
        {
          validator(_, value: string) {
            return isValidRecipient(value) ? Promise.resolve() : Promise.reject();
          },
          message:
            type === 'ethereum'
              ? t('Please fill in a {{network}} smart address which start with 0x', {
                  network: upperFirst(to.meta.name),
                })
              : t('Please enter a valid {{network}} address', { network: upperFirst(to.meta.name) }),
        },
      ]}
      extra={to ? <FormItemExtra>{extraTip}</FormItemExtra> : ''}
    >
      <div className="flex items-center gap-2">
        {type === 'ethereum' || !formattedAccounts?.length ? (
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

        {isPolkadot && bridge.activeAssistantConnection && (
          <Tooltip title={t('Connect {{network}} to fetch own accounts', { network: to.meta.name })}>
            <Button
              onClick={() => {
                connectAssistantNetwork(to.meta);
              }}
              type="link"
              icon={<ApiOutlined />}
            ></Button>
          </Tooltip>
        )}
      </div>
    </Form.Item>
  );
}
