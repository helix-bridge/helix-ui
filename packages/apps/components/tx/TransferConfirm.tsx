import { ArrowDownOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { i18n } from 'next-i18next';
import { PropsWithChildren, useMemo } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { BridgeBase } from 'shared/core/bridge';
import { CrossToken, PolkadotChainConfig } from 'shared/model';
import { convertToSS58 } from 'shared/utils/helper/address';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { getDisplayName } from 'utils/network/network';
import { TxConfirmComponentProps } from '../../model/component';

type Fee = Pick<CrossToken, 'symbol' | 'amount'>;

export function TransferConfirm<T extends BridgeBase = BridgeBase>({
  value,
  fee,
}: PropsWithChildren<TxConfirmComponentProps<T> & { fee: Fee | null }>) {
  const { from, to } = value.direction;
  const { t } = useTranslation('common', { i18n: i18n?.use(initReactI18next) });

  const sender = useMemo(
    () =>
      isPolkadotNetwork(value.direction.from.meta)
        ? convertToSS58(value.sender, (value.direction.from.meta as PolkadotChainConfig).ss58Prefix)
        : value.sender,
    [value]
  );

  const needClaim = !!value.direction.from.cross.find(
    (item) => item.partner.name === value.direction.to.host && item.bridge === value.bridge.name
  )?.partner.claim;

  return (
    <>
      <div className="flex flex-col">
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center space-x-3">
              <Logo name={from.meta.logos[0].name} width={36} height={36} />
              <div className="flex flex-col">
                <span className="font-bold">{getDisplayName(from.meta)}</span>
                <span className="opacity-50">{t('Source Chain')}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-bold text-red-500">-{from.amount}</span>
              <span className="font-bold">{from.symbol}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center space-x-3">
              <Logo name={to.meta.logos[0].name} width={36} height={36} />
              <div className="flex flex-col">
                <span className="font-bold">{getDisplayName(to.meta)}</span>
                <span className="opacity-50">{t('Target Chain')}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-bold text-green-400">+{to.amount}</span>
              <span className="font-bold">{to.symbol}</span>
            </div>
          </div>

          <div className="w-8 h-8 absolute top-0 bottom-0 left-0 right-0 m-auto flex justify-center items-center">
            <ArrowDownOutlined className="bg-white border p-1 rounded-full text-black" />
          </div>
        </div>

        <div className="mt-5 mb-3">
          <span>{t('Information')}</span>

          <div className="flex flex-col space-y-2 mt-1 p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center justify-between overflow-hidden">
              <span className="opacity-60">{t('From')}</span>
              <span className="truncate text-right w-11/12">{sender}</span>
            </div>

            <div className="flex items-center justify-between overflow-hidden">
              <span className="opacity-60">{t('To')}</span>
              <span className="truncate text-right w-11/12">{value.recipient}</span>
            </div>

            {fee && (
              <div className="flex items-center justify-between overflow-hidden">
                <span className="opacity-60">{t('Fee')}</span>
                <span>
                  {fee.amount} {fee.symbol}
                </span>
              </div>
            )}
          </div>
        </div>

        {needClaim && (
          <Alert
            type="warning"
            message={t(
              'Please initiate a claim transaction of the Ethereum Network in the Transfer History to receive this token. And it needs to prepare some ETH as the gas fee to claim this token.'
            )}
            showIcon
          />
        )}
      </div>
    </>
  );
}
