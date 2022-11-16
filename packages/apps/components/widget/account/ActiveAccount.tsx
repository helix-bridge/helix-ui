import {
  DisconnectOutlined,
  DollarOutlined,
  LoadingOutlined,
  SettingFilled,
  UserSwitchOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { numberToHex } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { Badge, Button, Dropdown, Menu, Tooltip } from 'antd';
import { Contract } from 'ethers';
import { i18n, Trans } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { isDev } from 'shared/config/env';
import { darwiniaConfig, goerliConfig, pangolinConfig, SYSTEM_CHAIN_CONFIGURATIONS } from 'shared/config/network';
import { ethereumConfig } from 'shared/config/network/ethereum';
import { ConnectionStatus, EthereumChainConfig, EthereumExtension, PolkadotExtension } from 'shared/model';
import { entrance, ethereumExtensions, polkadotExtensions } from 'shared/utils/connection';
import { Path } from '../../../config';
import abi from '../../../config/ethv1/abi.json';
import claimSource from '../../../config/ethv1/airdrop2.json';
import { contractAddress, merkleRoot } from '../../../config/ethv1/constant';
import { useAccount, useApi } from '../../../providers';
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
  const [isAccountSelectOpen, setIsAccountSelectOpen] = useState(false);
  const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);
  const [unclaimed, setUnclaimed] = useState(false);
  const router = useRouter();

  const disconnected = useMemo(() => {
    const { wallet, status } = departureConnection;

    return wallet !== 'unknown' && status !== ConnectionStatus.success;
  }, [departureConnection]);

  useEffect(() => {
    if (isEthereumAddress(account)) {
      const target = claimSource.find((item) => item.to.toLowerCase() === account.toLowerCase());

      if (!target) {
        setUnclaimed(false);
      } else {
        const contract = new Contract(contractAddress, abi, entrance.web3.getInstance(ethereumConfig.provider.https));
        (contract.claimed(target.to, merkleRoot) as Promise<boolean>).then((res: boolean) => setUnclaimed(!res));
      }
    } else {
      setUnclaimed(false);
    }
  }, [account]);

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

            {unclaimed && (
              <Badge
                count={
                  <Tooltip
                    title={
                      <Trans i18nKey="claimBadgeMsg" i18n={i18n?.use(initReactI18next)}>
                        The current account has unclaimed tokens on ethereum.
                        <div className="text-blue-400 cursor-pointer" onClick={() => router.push(Path.claimTool)}>
                          claim now
                        </div>
                      </Trans>
                    }
                  >
                    <DollarOutlined className="text-green-500" />
                  </Tooltip>
                }
                className="absolute -top-2 -right-2 z-20"
              ></Badge>
            )}

            {polkadotExtensions.includes(departureConnection.wallet as unknown as never) && (
              <Dropdown
                overlay={
                  <Menu
                    onClick={(event) => {
                      const { key } = event;

                      setIsWalletSelectOpen(key === 'wallet');
                      setIsAccountSelectOpen(key === 'account');
                    }}
                    items={[
                      {
                        key: 'wallet',
                        label: t('Switch Wallet'),
                        icon: <WalletOutlined />,
                      },
                      {
                        key: 'account',
                        label: t('Switch Account'),
                        icon: <UserSwitchOutlined />,
                      },
                    ]}
                  ></Menu>
                }
              >
                <Button
                  className="flex items-center justify-around px-1 overflow-hidden truncate ml-1"
                  icon={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/image/${departureConnection.wallet.split('-')[0]}.svg`} width={18} height={18} />
                  }
                  style={{ maxWidth: 200 }}
                >
                  <span className="truncate ml-1">{account}</span>

                  <Icon name="down" className="w-8 h-8" />
                </Button>
              </Dropdown>
            )}

            {ethereumExtensions.includes(departureConnection.wallet as unknown as never) && (
              <Button
                className="flex items-center justify-around px-1 overflow-hidden"
                icon={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/image/${departureConnection.wallet.split('-')[0]}.svg`} width={18} height={18} />
                }
                style={{ maxWidth: 200 }}
                onClick={() => setIsWalletSelectOpen(true)}
              >
                <span className="truncate ml-1">{account}</span>
              </Button>
            )}

            <span className="lg:hidden flex">
              <Identicon value={account} size={20} className="rounded-full border p-1" />
            </span>
          </section>

          <SettingFilled
            onClick={() => setIsAccountSelectOpen(true)}
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${departure.name}-main`}
          />
        </>
      ) : (
        <Button
          disabled={isConnecting}
          icon={isConnecting && <LoadingOutlined />}
          onClick={() => {
            setIsWalletSelectOpen(true);
          }}
        >
          {t('Connect to Wallet')}
        </Button>
      )}

      <SelectAccountModal
        visible={isAccountSelectOpen}
        accounts={departureConnection.accounts}
        defaultValue={account}
        onCancel={() => setIsAccountSelectOpen(false)}
        onSelect={(acc) => {
          setAccount(acc);
          setIsAccountSelectOpen(false);
        }}
        title={
          <div className="inline-flex space-x-1">
            <span>{t('Select active account')}</span>
          </div>
        }
        footer={null}
      />

      <SelectWalletModal
        visible={isWalletSelectOpen}
        defaultValue={departureConnection.wallet}
        onCancel={() => setIsWalletSelectOpen(false)}
        onSelect={(wallet) => {
          setIsWalletSelectOpen(false);

          if (departure.wallets.includes(wallet)) {
            connectDepartureNetwork(departure, wallet);
          } else if (ethereumExtensions.includes(wallet as EthereumExtension)) {
            entrance.web3.currentProvider.getNetwork().then((res) => {
              const chainId = numberToHex(+res.chainId);
              const config =
                SYSTEM_CHAIN_CONFIGURATIONS.find(
                  (item) => (item as EthereumChainConfig)?.ethereumChain?.chainId === chainId
                ) ?? (isDev ? goerliConfig : ethereumConfig);

              connectDepartureNetwork(config, wallet);
            });
          } else if (polkadotExtensions.includes(wallet as PolkadotExtension)) {
            const config = isDev ? pangolinConfig : darwiniaConfig;

            connectDepartureNetwork(config, wallet);
          } else {
            //
          }
        }}
        title={
          <div className="inline-flex space-x-1">
            <span>{t('Switch Wallet')}</span>
          </div>
        }
        footer={null}
      />
    </>
  );
}
