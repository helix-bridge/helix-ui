import { ArrowDownOutlined } from '@ant-design/icons';
import { Alert, Divider } from 'antd';
import { i18n } from 'next-i18next';
import { PropsWithChildren, useMemo } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import { Logo } from 'shared/components/widget/Logo';
import { BridgeBase } from 'shared/core/bridge';
import { PolkadotChainConfig } from 'shared/model';
import { convertToSS58 } from 'shared/utils/helper/address';
import { fromWei } from 'shared/utils/helper/balance';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { getDisplayName } from 'utils/network/network';
import { TokenWithAmount } from '../../core/bridge';
import { TxConfirmComponentProps } from '../../model/component';
import { isXCM } from '../../utils';

export function TransferConfirm<T extends BridgeBase = BridgeBase>({
  value,
  fee,
}: PropsWithChildren<TxConfirmComponentProps<T> & { fee: TokenWithAmount }>) {
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
      <Divider />

      <div className="flex flex-col gap-8">
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

        <div>
          <span>{t('Information')}</span>

          <div className="flex flex-col space-y-2 mt-1 p-3 bg-gray-900 border border-gray-800">
            <div className="flex items-center justify-between overflow-hidden">
              <span className="opacity-60">{t('Bridge')}</span>
              <span className="truncate text-right w-11/12 capitalize">{value.bridge.category}</span>
            </div>

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
                <span className="opacity-60">{t('Transaction Fee')}</span>
                <span>
                  {fromWei(fee)} {fee.symbol}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between overflow-hidden">
              <span className="opacity-60">{t('Estimate Arrival Time')}</span>
              <span>
                {t('{{estimate}} Minutes', { estimate: value.bridge.category === 'cBridge' ? '5-20' : '1-3' })}
              </span>
            </div>
          </div>
        </div>

        {needClaim && (
          <Alert
            type="warning"
            message={
              <span className="text-gray-900">
                {t(
                  'Please initiate a claim transaction on Ethereum in the Transaction Detail Page to receive this token. And it needs to prepare some ETH as the gas fee to claim this token.'
                )}
              </span>
            }
            className="bg-white"
            showIcon
          />
        )}

        {isXCM(value.direction) && (
          <Alert
            type="warning"
            message={
              <span className="text-gray-900">
                {t(
                  'Please pay extra attention when using XCM transfer. It is important for users to confirm each and every setting information to avoid financial loss. Be Aware of risks, including but not limited to, incorrect settings of XCM message may result in loss of funds'
                )}
              </span>
            }
            className="bg-white"
            showIcon
          />
        )}
      </div>

      <Divider />
    </>
  );
}
