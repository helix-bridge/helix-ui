import { Button, ButtonProps, Form } from 'antd';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, ConnectionStatus } from 'shared/model';
import { useApi } from '../../providers';

interface SubmitButtonProps extends ButtonProps {
  from: ChainConfig;
  to: ChainConfig;
  requireTo?: boolean;
  hideSubmit?: boolean;
  launch?: () => void;
}

export function FromItemButton({ children, className, ...others }: ButtonProps) {
  return (
    <Form.Item wrapperCol={{ offset: 0, span: 24 }} className="my-4">
      <Button
        type="primary"
        size="large"
        {...others}
        className={`ax-auto w-full text-white flex items-center capitalize ${className} `}
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
}: PropsWithChildren<SubmitButtonProps>) {
  const { t } = useTranslation();
  const {
    mainConnection: { status },
    connectNetwork,
  } = useApi();

  const errorConnections: ConnectionStatus[] = [
    ConnectionStatus.pending,
    ConnectionStatus.disconnected,
    ConnectionStatus.fail,
    ConnectionStatus.error,
  ];

  return !launch || errorConnections.includes(status) ? (
    <FromItemButton
      onClick={() => {
        connectNetwork(from);
      }}
    >
      {children || t('Connect to Wallet')}
    </FromItemButton>
  ) : (
    <FromItemButton
      disabled={(!!requireTo && !to) || disabled}
      onClick={() => {
        launch();
      }}
    >
      {children || t('Transfer')}
    </FromItemButton>
  );
}
