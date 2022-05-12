import { ApiOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, Tooltip } from 'antd';
import { upperFirst } from 'lodash';
import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IdentAccountAddress } from 'shared/components/widget/IdentAccountAddress';
import { FORM_CONTROL } from 'shared/config/constant';
import { ConnectionStatus, CrossChainComponentProps, PolkadotChainConfig } from 'shared/model';
import { convertToSS58, isSameAddress, isValidAddressStrict, patchUrl } from 'shared/utils/helper';
import { isPolkadotNetwork } from 'shared/utils/network';
import { useApi } from '../../providers';

// eslint-disable-next-line complexity
export function RecipientItem({
  form,
  extraTip,
  direction,
  onChange,
  bridge,
}: Pick<CrossChainComponentProps, 'form' | 'direction' | 'bridge'> & {
  extraTip?: string | ReactNode;
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { departureConnection, arrivalConnection, connectArrivalNetwork } = useApi();

  const formattedAccounts = useMemo(
    () =>
      arrivalConnection.accounts?.map((item) => ({
        ...item,
        address: convertToSS58(item.address, (direction.to.meta as PolkadotChainConfig).ss58Prefix),
      })),
    [arrivalConnection.accounts, direction.to.meta]
  );

  const { to } = direction;
  const isPolkadot = isPolkadotNetwork(to.meta) && to.meta.mode === 'native';
  const type = isPolkadot ? to.meta.name : 'ethereum';

  const displayLink = useMemo(() => {
    return isPolkadot && bridge.activeArrivalConnection && arrivalConnection.type !== 'polkadot';
  }, [arrivalConnection.type, bridge.activeArrivalConnection, isPolkadot]);

  const isValidRecipient = useCallback((value: string) => isValidAddressStrict(value, type), [type]);

  if (departureConnection.status !== ConnectionStatus.success) {
    return null;
  }

  return (
    <Form.Item
      label={
        <span className="inline-flex items-center justify-between gap-2">
          <span>{t('Recipient')}</span>
          {displayLink && (
            <Tooltip title={t('Connect {{network}} to fetch own accounts', { network: to.meta.name })}>
              <Button
                onClick={() => {
                  connectArrivalNetwork(to.meta);
                }}
                type="link"
                icon={<ApiOutlined />}
              ></Button>
            </Tooltip>
          )}
        </span>
      }
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
              ? t('Please fill in a {{network}} address which start with 0x', {
                  network: upperFirst(to.meta.name),
                })
              : t('Please enter a valid {{network}} address', { network: upperFirst(to.meta.name) }),
        },
      ]}
      extra={to ? <span>{extraTip}</span> : ''}
    >
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
    </Form.Item>
  );
}
