import { ArrowRightOutlined } from '@ant-design/icons';
import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bridge, PolkadotChainConfig, TxConfirmComponentProps } from 'shared/model';
import { convertToSS58, getDisplayName, isPolkadotNetwork } from 'shared/utils';
import { IDescription } from '../widget/IDescription';

export function TransferConfirm<T extends Bridge = Bridge>({
  value,
  children,
}: PropsWithChildren<TxConfirmComponentProps<T>>) {
  const { t } = useTranslation();

  const amountDes = useMemo(() => {
    if (children) {
      return children;
    } else {
      const { amount, symbol } = value.direction.from;
      return (
        <IDescription
          title={t('Amount')}
          content={
            <span>
              {amount}
              <span className="uppercase ml-2">{symbol}</span>
            </span>
          }
        />
      );
    }
  }, [children, t, value.direction.from]);

  const sender = useMemo(
    () =>
      isPolkadotNetwork(value.direction.from.meta) && value.direction.from.meta.mode === 'native'
        ? convertToSS58(value.sender, (value.direction.from.meta as PolkadotChainConfig).ss58Prefix)
        : value.sender,
    [value]
  );

  return (
    <>
      <IDescription
        title={t('Cross-chain direction')}
        content={
          <>
            <span className="capitalize">{getDisplayName(value.direction.from.meta)}</span>
            <ArrowRightOutlined className="mx-4" />
            <span className="capitalize">{getDisplayName(value.direction.to.meta)}</span>
          </>
        }
      />

      <IDescription title={t('Sender Account')} content={sender} />

      <IDescription title={t('Recipient')} content={value.recipient}></IDescription>

      {amountDes}
    </>
  );
}
