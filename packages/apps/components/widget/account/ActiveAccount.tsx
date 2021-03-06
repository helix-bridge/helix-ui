import { CloseCircleOutlined, DisconnectOutlined, LoadingOutlined, SettingFilled } from '@ant-design/icons';
import { Badge, Button, message, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { isFormalChain, isTestChain } from 'shared/config/env';
import { crabDVMConfig, darwiniaConfig, pangolinConfig } from 'shared/config/network';
import { pangolinDVMConfig } from 'shared/config/network/pangolin-dvm';
import { ChainConfig, ConnectionStatus, EthereumChainConfig, SupportedWallet } from 'shared/model';
import { switchEthereumChain } from 'shared/utils/connection';
import { convertToSS58 } from 'shared/utils/helper';
import { isPolkadotNetwork } from 'shared/utils/network';
import { useAccount, useApi, useWallet } from '../../../providers';
import { SelectAccountModal } from './SelectAccountModal';
import { SelectWalletModal } from './SelectWalletModal';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

export function ActiveAccount() {
  const router = useRouter();
  const isTransfer = router.pathname === '/';

  return isTransfer ? <ActiveAccountStrict /> : <ActiveAccountNormal />;
}

// eslint-disable-next-line complexity
function ActiveAccountStrict() {
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

function ActiveAccountNormal() {
  const { departureConnection, departure, connectDepartureNetwork, isConnecting } = useApi();
  const { t } = useTranslation();
  const { account: address, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);

  const disconnected = useMemo(() => {
    const { type, status } = departureConnection;

    return type !== 'unknown' && status !== ConnectionStatus.success;
  }, [departureConnection]);

  const prefix = useMemo(() => (isFormalChain ? darwiniaConfig.ss58Prefix : pangolinConfig.ss58Prefix), []);
  const account = useMemo(() => convertToSS58(address, prefix), [address, prefix]);

  const accounts = useMemo(
    () => departureConnection.accounts.map((item) => ({ ...item, address: convertToSS58(item.address, prefix) })),
    [departureConnection.accounts, prefix]
  );

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
              icon={<img src={`/image/${departureConnection.type}.svg`} width={18} height={18} />}
              style={{ maxWidth: 200 }}
              onClick={() => {
                if (departureConnection.accounts.length > 1) {
                  setIsVisible(true);
                } else {
                  setIsWalletVisible(true);
                }
              }}
            >
              <span className="truncate ml-1">{account}</span>

              {departureConnection.accounts.length > 1 && <Icon name="down" className="w-8 h-8" />}
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
          onClick={() => setIsWalletVisible(true)}
        >
          {t('Connect to Wallet')}
        </Button>
      )}

      <SelectAccountModal
        visible={isVisible}
        defaultValue={account}
        accounts={accounts}
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
          let config: ChainConfig;

          if (wallet === 'metamask') {
            config = isTestChain ? pangolinDVMConfig : crabDVMConfig;
          } else {
            config = isTestChain ? pangolinConfig : darwiniaConfig;
          }

          setIsWalletVisible(false);
          connectDepartureNetwork(config);
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
