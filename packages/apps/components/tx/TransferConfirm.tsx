import { ArrowDownOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { i18n } from 'next-i18next';
import { PropsWithChildren, useMemo } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';
import { Logo } from 'shared/components/widget/Logo';
import { Bridge, CrossToken, PolkadotChainConfig, TxConfirmComponentProps } from 'shared/model';
import { convertToSS58 } from 'shared/utils/helper';
import { getDisplayName, isPolkadotNetwork } from 'shared/utils/network';

type Fee = Pick<CrossToken, 'symbol' | 'amount'>;

export function TransferConfirm<T extends Bridge = Bridge>({
  value,
  fee,
}: PropsWithChildren<TxConfirmComponentProps<T> & { fee: Fee | null }>) {
  const { from, to } = value.direction;
  const { t } = useTranslation('common', { i18n: i18n?.use(initReactI18next) });

  const sender = useMemo(
    () =>
      isPolkadotNetwork(value.direction.from.meta) && value.direction.from.meta.mode === 'native'
        ? convertToSS58(value.sender, (value.direction.from.meta as PolkadotChainConfig).ss58Prefix)
        : value.sender,
    [value]
  );

  return (
    <>
      <div className="flex flex-col">
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center space-x-3">
              <Logo name={from.meta.logos[0].name} width={36} height={36} />
              <div className="flex flex-col">
                <Typography.Text strong>{getDisplayName(from.meta)}</Typography.Text>
                <Typography.Text className="opacity-50">{t('Source Chain')}</Typography.Text>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Typography.Text strong type="danger">
                {from.amount}
              </Typography.Text>
              <Typography.Text strong>{from.symbol}</Typography.Text>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center space-x-3">
              <Logo name={to.meta.logos[0].name} width={36} height={36} />
              <div className="flex flex-col">
                <Typography.Text strong>{getDisplayName(to.meta)}</Typography.Text>
                <Typography.Text className="opacity-50">{t('Target Chain')}</Typography.Text>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Typography.Text strong type="success">
                {to.amount}
              </Typography.Text>
              <Typography.Text strong>{to.symbol}</Typography.Text>
            </div>
          </div>

          <div className="w-8 h-8 absolute top-0 bottom-0 left-0 right-0 m-auto flex justify-center items-center">
            <ArrowDownOutlined className="bg-white border p-1 rounded-full text-black" />
          </div>
        </div>

        <div className="mt-5 mb-3">
          <Typography.Text>{t('Info')}</Typography.Text>

          <div className="flex flex-col space-y-2 mt-1 p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center justify-between overflow-hidden">
              <Typography.Text className="opacity-60">{t('From')}</Typography.Text>
              <EllipsisMiddle className="w-2/3 text-right">{sender}</EllipsisMiddle>
            </div>

            <div className="flex items-center justify-between overflow-hidden">
              <Typography.Text className="opacity-60">{t('To')}</Typography.Text>
              <EllipsisMiddle className="w-2/3 text-right">{value.recipient}</EllipsisMiddle>
            </div>

            {fee && (
              <div className="flex items-center justify-between overflow-hidden">
                <Typography.Text className="opacity-60">{t('Fee')}</Typography.Text>
                <Typography.Text>
                  {fee.amount} {from.symbol}
                </Typography.Text>
              </div>
            )}
          </div>
        </div>

        <Alert
          type="warning"
          message={t(
            'Please initiate a claim transaction of the Ethereum Network in the Transfer History to receive this token. And it needs to prepare some ETH as the gas fee to claim this token.'
          )}
          showIcon
        />
      </div>
    </>
  );
}
