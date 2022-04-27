import { ArrowRightOutlined } from '@ant-design/icons';
import { CrossChainAsset, CrossChainPayload, PolkadotChainConfig, TxConfirmComponentProps } from 'shared/model';
import { convertToSS58, fromWei, isPolkadotNetwork } from 'shared/utils';
import { getDisplayName } from 'next/dist/shared/lib/utils';
import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IDescription } from '../widget/IDescription';

export function TransferConfirm({
  value,
  children,
  decimals = 18,
}: PropsWithChildren<TxConfirmComponentProps<CrossChainPayload>>) {
  const { t } = useTranslation();

  const amountDes = useMemo(() => {
    if (children) {
      return children;
    } else if (value.assets) {
      return (
        <IDescription
          title={t('Amount')}
          content={value.assets.map((bill: CrossChainAsset<string> & { decimals?: number }) => (
            <span key={bill.asset} className="mr-6">
              {fromWei({ value: bill.amount, decimals: bill.decimals ?? decimals })}
              <span className="ml-2">{bill.asset}</span>
            </span>
          ))}
        ></IDescription>
      );
    } else {
      return (
        <IDescription
          title={t('Amount')}
          content={
            <span>
              {fromWei({ value: value.amount, decimals })}
              <span className="uppercase ml-2">{value.asset}</span>
            </span>
          }
        />
      );
    }
  }, [children, t, decimals, value.amount, value.asset, value.assets]);

  const sender = useMemo(
    () =>
      isPolkadotNetwork(value.direction.from) && value.direction.from.mode === 'native'
        ? convertToSS58(value.sender, (value.direction.from as PolkadotChainConfig).ss58Prefix)
        : value.sender,
    [value]
  );

  return (
    <>
      <IDescription
        title={t('Cross-chain direction')}
        content={
          <>
            <span className="capitalize">{getDisplayName(value.direction.from)}</span>
            <ArrowRightOutlined className="mx-4" />
            <span className="capitalize">{getDisplayName(value.direction.to)}</span>
          </>
        }
      />

      <IDescription title={t('Sender Account')} content={sender} />

      <IDescription title={t('Recipient')} content={value.recipient}></IDescription>

      {amountDes}
    </>
  );
}
