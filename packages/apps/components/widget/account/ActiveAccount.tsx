import { DisconnectOutlined, LoadingOutlined, SettingFilled } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { isEqual } from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { ChainConfig, ConnectionStatus } from 'shared/model';
import { getConfigByConnection } from 'shared/utils/connection';
import { useAccount, useApi } from '../../../providers';
import { SelectAccountModal } from './SelectAccountModal';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

export function ActiveAccount() {
  const { departureConnection, departure, connectDepartureNetwork, disconnect, isConnecting } = useApi();
  const { t } = useTranslation();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);
  const [matched, setMatched] = useState(true);
  const [configForConnection, setConfigConnection] = useState<ChainConfig>(departure);

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

    getConfigByConnection(departureConnection).then((config) => {
      setMatched(!config || isEqual(departure, config));

      if (config) {
        setConfigConnection(config);
      }
    });
  }, [connectDepartureNetwork, departureConnection, departure]);

  return (
    <>
      {departureConnection.accounts.length >= 1 ? (
        <>
          <section
            onClick={() => {
              if (departureConnection.accounts.length > 1) {
                setIsVisible(true);
              }
            }}
            className={`flex items-center gap-2 relative`}
          >
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
              className={`flex items-center px-2 gap-2 overflow-hidden`}
              icon={<img src={`/image/${configForConnection.logos[0].name}`} width={24} height={24} />}
              style={{ maxWidth: 200 }}
              danger={!matched}
            >
              <span className="truncate">{account}</span>

              {departureConnection.accounts.length > 1 && <Icon name="down" className="w-8 h-8" />}
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
          if (acc !== account) {
            setAccount(acc);
          }
          setIsVisible(false);
        }}
        title={
          <div className="inline-flex items-center space-x-1">
            <span>{t('Select active account')}</span>
          </div>
        }
        footer={null}
      />
    </>
  );
}
