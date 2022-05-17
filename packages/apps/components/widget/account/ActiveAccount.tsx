import {
  CloseCircleOutlined,
  DisconnectOutlined,
  InfoCircleFilled,
  LoadingOutlined,
  SettingFilled,
} from '@ant-design/icons';
import { Badge, Button, message, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { ConnectionStatus, EthereumChainConfig, SupportedWallet } from 'shared/model';
import { switchEthereumChain } from 'shared/utils/connection';
import { useAccount, useApi } from '../../../providers';
import { SelectAccountModal } from './SelectAccountModal';
import { SelectWalletModal } from './SelectWalletModal';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

// eslint-disable-next-line complexity
export function ActiveAccount() {
  const { departureConnection, departure, connectDepartureNetwork, disconnect, isConnecting } = useApi();
  const { t } = useTranslation();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const [matched, setMatched] = useState(true);

  const disconnected = useMemo(() => {
    const { type, status } = departureConnection;

    return type !== 'unknown' && status !== ConnectionStatus.success;
  }, [departureConnection]);

  useEffect(() => {
    const { type } = departureConnection;

    if (type === 'unknown') {
      setMatched(true);
      return;
    }

    // const config = convertConnectionToChainConfig(departureConnection);

    setMatched(departure.wallets.includes(departureConnection.type as SupportedWallet));
  }, [departure, departureConnection]);

  return (
    <>
      {departureConnection.accounts.length >= 1 ? (
        <>
          <section className={`flex items-center relative`}>
            {disconnected && (
              <Badge
                count={
                  <Tooltip title={t('Wallet provider offline')}>
                    <DisconnectOutlined className="text-red-500" />
                  </Tooltip>
                }
                className="absolute -top-2 -right-2 z-20"
              ></Badge>
            )}

            {matched &&
              (departure as EthereumChainConfig).ethereumChain &&
              (departure as EthereumChainConfig).ethereumChain.chainId !== departureConnection.chainId && (
                <Badge
                  count={
                    <Tooltip title={t('Chain mismatched')}>
                      <InfoCircleFilled
                        onClick={() => switchEthereumChain(departure as EthereumChainConfig)}
                        className="text-yellow-300"
                      />
                    </Tooltip>
                  }
                  className="absolute -top-2 -right-2 z-20"
                ></Badge>
              )}

            <Button
              className={`flex items-center justify-around px-2 gap-2 overflow-hidden`}
              icon={
                matched ? (
                  <img src={`/image/${departureConnection.type}.svg`} width={24} height={24} className="mr-2" />
                ) : (
                  <CloseCircleOutlined />
                )
              }
              style={{ maxWidth: 200 }}
              danger={!matched}
              type={!matched ? 'primary' : 'default'}
              onClick={() => {
                if (!matched) {
                  setIsWalletVisible(true);
                  return;
                }

                if (matched && departureConnection.accounts.length > 1) {
                  setIsVisible(true);
                }
              }}
            >
              <span className="truncate">{matched ? account : t('Wrong Network')}</span>

              {departureConnection.accounts.length > 1 && matched && <Icon name="down" className="w-8 h-8" />}
            </Button>

            <span className="lg:hidden flex">
              <Identicon value={account} size={20} className="rounded-full border p-1" />
            </span>
          </section>

          <Button onClick={() => disconnect()} className="hidden lg:block">
            {t('Disconnect')}
          </Button>

          <SettingFilled
            onClick={() => setIsVisible(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${departure.name}-main`}
          />
        </>
      ) : (
        <Button
          disabled={isConnecting}
          icon={isConnecting && <LoadingOutlined />}
          onClick={() => connectDepartureNetwork(departure)}
        >
          {t('Connect Wallet')}
        </Button>
      )}

      <SelectAccountModal
        visible={isVisible}
        defaultValue={account}
        onCancel={() => setIsVisible(false)}
        onSelect={(acc) => {
          setAccount(acc);
          setIsVisible(false);
        }}
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select active account')}</span>
          </div>
        }
        footer={null}
      />

      <SelectWalletModal
        visible={isWalletVisible}
        defaultValue={departureConnection.type}
        onCancel={() => setIsWalletVisible(false)}
        onSelect={(wallet) => {
          setIsWalletVisible(false);

          if (departure.wallets.includes(wallet as SupportedWallet)) {
            connectDepartureNetwork(departure);
          } else {
            message.error(t('The selected wallet does not match the token to be transferred'));
          }
        }}
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Switch wallet')}</span>
          </div>
        }
        footer={null}
      />
    </>
  );
}
