import { DisconnectOutlined, LinkOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Popover, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, Subscription } from 'rxjs';
import { useApi } from '../../hooks';
import { ChainConfig, EthereumChainConfig, EthereumConnection } from '../../model';
import {
  getConfigByConnection,
  getDisplayName,
  isChainIdEqual,
  isDVM,
  isEthereumNetwork,
  isPolkadotNetwork,
  isSameNetConfig,
} from '../../utils';

interface LinkIndicatorProps {
  config: ChainConfig | null;
  showSwitch?: boolean;
}

// eslint-disable-next-line complexity
export function ConnectionIndicator({ config, showSwitch }: LinkIndicatorProps) {
  const { t } = useTranslation();
  const { mainConnection: connection, network, connectNetwork } = useApi();
  const [isConsistent, setIsConsistent] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState<ChainConfig | null>(null);

  // eslint-disable-next-line complexity
  useEffect(() => {
    let is = !!config && isSameNetConfig(config, network);
    let subscription: Subscription | null = null;

    if (!is) {
      setIsConsistent(false);
      return;
    }

    if ((config && isDVM(config)) || isEthereumNetwork(config?.name)) {
      is =
        connection.type === 'metamask' &&
        isChainIdEqual(
          (connection as EthereumConnection).chainId,
          (config! as unknown as EthereumChainConfig).ethereumChain?.chainId
        );

      setIsConsistent(is);
    } else if (isPolkadotNetwork(config?.name)) {
      subscription = from(getConfigByConnection(connection)).subscribe((conf) => {
        is = connection.type === 'polkadot' && isSameNetConfig(config, conf);
        setIsConsistent(is);
      });
    } else {
      setIsConsistent(is);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [config, connection, network, setIsConsistent]);

  useEffect(() => {
    const subscription = from(getConfigByConnection(connection)).subscribe(setConnectionConfig);

    return () => subscription.unsubscribe();
  }, [connection]);

  if (connection.status === 'connecting') {
    return <SyncOutlined spin className="text-blue-500" />;
  }

  if (connection.status === 'success') {
    return (
      <Popover
        content={
          <div className="max-w-sm flex flex-col">
            {config?.name && showSwitch && !isConsistent ? (
              <>
                <span>
                  {t(
                    'The connected network is not the same as the network selected, do you want switch to the {{network}} network?',
                    { network: getDisplayName(config) }
                  )}
                </span>
                <Button
                  onClick={() => {
                    // FIXME: 如果是因为 chainId 变化导致的不一致，用户点了后，需要再点一次 chainId校验 通知中的按钮才能触发 metamask 网络切换
                    connectNetwork(config);
                  }}
                  className="self-end mt-2"
                >
                  {t('Switch')}
                </Button>
              </>
            ) : (
              <span>
                {t('The current network is connected to {{network}}', {
                  network: connectionConfig ? getDisplayName(connectionConfig) : '',
                })}
              </span>
            )}
          </div>
        }
      >
        <LinkOutlined className={isConsistent ? 'text-green-500' : 'text-red-500'} />
      </Popover>
    );
  }

  return (
    <Tooltip title={t('Network disconnected')}>
      <DisconnectOutlined className="text-red-500" />
    </Tooltip>
  );
}
