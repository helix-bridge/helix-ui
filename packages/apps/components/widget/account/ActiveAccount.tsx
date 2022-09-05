import { CloseCircleOutlined, DisconnectOutlined, LoadingOutlined, SettingFilled } from '@ant-design/icons';
import { Badge, Button, message, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { ConnectionStatus, EthereumChainConfig, SupportedWallet } from 'shared/model';
import { switchEthereumChain } from 'shared/utils/connection';
import { updateStorage } from 'shared/utils/helper';
import { isPolkadotNetwork } from 'shared/utils/network';
import { useAccount, useApi, useWallet } from '../../../providers';
import { SelectAccountModal } from './SelectAccountModal';
import { SelectWalletModal } from './SelectWalletModal';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

// eslint-disable-next-line complexity
export default function ActiveAccount() {
  const { departureConnection, departure, connectDepartureNetwork, isConnecting } = useApi();
  const { t } = useTranslation();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const { matched, walletMatched, chainMatched } = useWallet();

  const disconnected = useMemo(() => {
    const { type, status } = departureConnection;

    return type !== 'unknown' && status !== ConnectionStatus.success;
  }, [departureConnection]);

  useEffect(() => {
    if (
      departureConnection.type === 'polkadot' &&
      departureConnection.accounts.length >= 1 &&
      isPolkadotNetwork(departure)
    ) {
      connectDepartureNetwork(departure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departure, departureConnection.accounts.length, departureConnection.type]);

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

            <Button
              className={`flex items-center justify-around px-1 overflow-hidden`}
              icon={
                matched ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/image/${departureConnection.type}.svg`} width={18} height={18} />
                ) : (
                  <CloseCircleOutlined />
                )
              }
              style={{ maxWidth: 200 }}
              danger={!matched}
              type={!matched ? 'primary' : 'default'}
              // eslint-disable-next-line complexity
              onClick={() => {
                if (!chainMatched && departure.wallets.includes('metamask')) {
                  switchEthereumChain(departure as EthereumChainConfig);
                  return;
                }

                if (!walletMatched) {
                  setIsWalletVisible(true);
                  return;
                }

                if (walletMatched && departureConnection.accounts.length > 1) {
                  setIsVisible(true);
                }
              }}
            >
              <span className="truncate ml-1">{matched ? account : t('Wrong Network')}</span>

              {departureConnection.accounts.length > 1 && matched && <Icon name="down" className="w-8 h-8" />}
            </Button>

            <span className="lg:hidden flex">
              <Identicon value={account} size={20} className="rounded-full border p-1" />
            </span>
          </section>

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
          className={chainMatched ? '' : 'text-red-500 border-red-500'}
        >
          {t('Connect to Wallet')}
        </Button>
      )}

      <SelectAccountModal
        visible={isVisible}
        accounts={departureConnection.accounts}
        defaultValue={account}
        onCancel={() => setIsVisible(false)}
        onSelect={(acc) => {
          setAccount(acc);
          updateStorage({ [departureConnection.type]: acc });
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
