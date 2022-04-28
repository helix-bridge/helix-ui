import { ChainConfig, ConnectionStatus } from 'shared/model';
import { getDisplayName, hasBridge, isBridgeAvailable, isSameNetConfig } from 'shared/utils';
import { Button, ButtonProps, Form } from 'antd';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useTx } from '../../hooks';

interface SubmitButtonProps extends ButtonProps {
  from: ChainConfig | null;
  to: ChainConfig | null;
  requireTo?: boolean;
  hideSubmit?: boolean;
  launch?: () => void;
}

export function FromItemButton({ children, className, ...others }: ButtonProps) {
  return (
    <Form.Item className="my-4">
      <Button
        type="primary"
        size="large"
        {...others}
        className={`ax-auto w-full rounded-xl text-white flex items-center capitalize ${className} `}
      >
        <span className="whitespace-nowrap overflow-hidden overflow-ellipsis w-full">{children}</span>
      </Button>
    </Form.Item>
  );
}

// eslint-disable-next-line complexity
export function SubmitButton({
  from,
  to,
  children,
  requireTo,
  disabled,
  launch,
  hideSubmit = false,
}: PropsWithChildren<SubmitButtonProps>) {
  const { t } = useTranslation();
  const {
    mainConnection: { status },
    network,
    setNetwork,
    connectNetwork,
  } = useApi();
  const { tx } = useTx();
  const errorConnections: ConnectionStatus[] = [
    ConnectionStatus.pending,
    ConnectionStatus.disconnected,
    ConnectionStatus.fail,
    ConnectionStatus.error,
  ];

  if (tx) {
    return <FromItemButton disabled>{t(tx.status)}</FromItemButton>;
  }

  if (from?.name && to?.name && hasBridge([from, to]) && !isBridgeAvailable(from, to)) {
    return <FromItemButton disabled>{t('Coming Soon')}</FromItemButton>;
  }

  if (status === 'connecting') {
    return <FromItemButton disabled>{t('Connecting ...')}</FromItemButton>;
  }

  if (status === 'success' && from && !isSameNetConfig(from, network)) {
    return (
      <FromItemButton onClick={() => setNetwork(from)}>
        {t('Switch to {{network}}', { network: getDisplayName(from) })}
      </FromItemButton>
    );
  }

  if (errorConnections.includes(status) && !!from?.name) {
    return (
      <FromItemButton
        onClick={() => {
          connectNetwork(from);
        }}
      >
        {t('Connect to {{network}}', { network: getDisplayName(from) })}
      </FromItemButton>
    );
  }

  if ((status === 'success' && !from?.name) || status === 'pending' || hideSubmit) {
    return null;
  }

  return !launch ? (
    <FromItemButton disabled={(!!requireTo && !to) || disabled} htmlType="submit">
      {children || t('Submit')}
    </FromItemButton>
  ) : (
    <FromItemButton
      disabled={(!!requireTo && !to) || disabled}
      onClick={() => {
        launch();
      }}
    >
      {children || t('Submit')}
    </FromItemButton>
  );
}
