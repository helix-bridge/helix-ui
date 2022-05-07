import { SettingFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { isEqual } from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { ConnectionStatus } from 'shared/model';
import { getConfigByConnection } from 'shared/utils';
import { useAccount, useApi } from '../../../providers';
import { SelectAccountModal } from './SelectAccountModal';

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
  ssr: false,
});

export function ActiveAccount() {
  const { mainConnection, network, connectNetwork, disconnect } = useApi();
  const { t } = useTranslation();
  const { account, setAccount } = useAccount();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const { status } = mainConnection;

    if (status === ConnectionStatus.success) {
      getConfigByConnection(mainConnection).then((config) => {
        if (config && !isEqual(network, config)) {
          connectNetwork(network);
        }
      });
    }
  }, [connectNetwork, mainConnection, network]);

  return (
    <>
      {mainConnection.accounts.length >= 1 ? (
        <>
          <section
            onClick={() => {
              if (mainConnection.accounts.length > 1) {
                setIsVisible(true);
              }
            }}
            className={`flex items-center gap-2`}
          >
            <Button
              className={`flex items-center px-2 gap-2 overflow-hidden`}
              icon={<img src={`/image/${network.logos[0].name}`} width={24} height={24} />}
              style={{ maxWidth: 200 }}
            >
              <span className="truncate">{account}</span>

              {mainConnection.accounts.length > 1 && <Icon name="down" className="w-8 h-8" />}
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
            className={`lg:hidden inline-flex items-center text-2xl h-8 text-${network.name}-main`}
          />
        </>
      ) : (
        <Button onClick={() => connectNetwork(network)}>{t('Connect Wallet')}</Button>
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
