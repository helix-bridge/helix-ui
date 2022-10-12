import { ApiOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, Tooltip } from 'antd';
import upperFirst from 'lodash/upperFirst';
import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IdentAccountAddress } from 'shared/components/widget/IdentAccountAddress';
import { FORM_CONTROL } from 'shared/config/constant';
import { BridgeBase } from 'shared/core/bridge';
import { ConnectionStatus, PolkadotChainConfig } from 'shared/model';
import { convertToSS58 } from 'shared/utils/helper/address';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { CrossChainComponentProps } from '../../model/component';
import { useApi } from '../../providers';
import { getDisplayName } from '../../utils/network/network';
import { isValidAddressStrict } from '../../utils/validate';

// eslint-disable-next-line complexity
export function RecipientItem({
  extraTip,
  direction,
  onChange,
  bridge,
}: Pick<CrossChainComponentProps<BridgeBase>, 'form' | 'direction' | 'bridge'> & {
  extraTip?: string | ReactNode;
  onChange?: (value: string) => void;
}) {
  const { t } = useTranslation();
  const { departureConnection, arrivalConnection, connectArrivalNetwork } = useApi();
  const { to } = direction;
  const isPolkadot = isPolkadotNetwork(to.meta);
  const type = isPolkadot ? to.meta.name : 'ethereum';

  const displayLink = useMemo(() => {
    return isPolkadot && bridge.activeArrivalConnection && arrivalConnection.type !== 'polkadot';
  }, [arrivalConnection.type, bridge.activeArrivalConnection, isPolkadot]);

  const accounts = useMemo(() => {
    const prefix = (direction.to.meta as PolkadotChainConfig).ss58Prefix;
    const source = arrivalConnection.accounts ?? [];

    return prefix === undefined
      ? source
      : source.map((item) => ({ ...item, address: convertToSS58(item.address, prefix) }));
  }, [arrivalConnection.accounts, direction.to.meta]);

  const isValidRecipient = useCallback((value: string) => isValidAddressStrict(value, type), [type]);

  if (departureConnection.status !== ConnectionStatus.success) {
    return null;
  }

  return (
    <div className="relative">
      <Form.Item
        label={t('Recipient')}
        name={FORM_CONTROL.recipient}
        validateFirst
        validateTrigger="onBlur"
        className="mb-4"
        rules={[
          { required: true },
          {
            validator(_, value: string) {
              return isValidRecipient(value) ? Promise.resolve() : Promise.reject();
            },
            message:
              type === 'ethereum'
                ? t('Please fill in a {{network}} address which start with 0x', {
                    network: getDisplayName(to.meta),
                  })
                : t('Please enter a valid {{network}} address', { network: upperFirst(to.meta.name) }),
          },
        ]}
        extra={to ? <span className="text-xs">{extraTip}</span> : ''}
      >
        {type === 'ethereum' || !accounts?.length ? (
          <Input
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
            {accounts.map((item) => (
              <AutoComplete.Option value={item.address} key={item.address}>
                <IdentAccountAddress account={item} />
              </AutoComplete.Option>
            ))}
          </AutoComplete>
        )}
      </Form.Item>

      <div className="absolute top-0 right-0">
        {displayLink && (
          <Tooltip title={t('Fetch own accounts')}>
            <Button
              size="small"
              onClick={() => connectArrivalNetwork(to.meta)}
              type="link"
              icon={<ApiOutlined />}
            ></Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
