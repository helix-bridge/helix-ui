import { Button, ButtonProps } from 'antd';
import { Trans } from 'react-i18next';
import { Network } from '../../model';

export function MaxBalance({ onClick, ...others }: { network: Network } & ButtonProps) {
  return (
    <Button
      style={{
        borderRadius: '0 10px 10px 0',
        borderLeft: 'none',
        maxWidth: '4rem',
      }}
      {...others}
      onClick={onClick}
      className="ant-input-number"
    >
      <Trans>Max</Trans>
    </Button>
  );
}
