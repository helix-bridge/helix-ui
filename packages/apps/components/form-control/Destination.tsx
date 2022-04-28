import { Button, Form, InputNumber, InputNumberProps } from 'antd';
import { useState } from 'react';
import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { darwiniaConfig } from 'shared/config/network';
import { CrossToken } from 'shared/model';
import { SelectTokenModal, TokenInfoWithMeta } from '../transfer/SelectTokenModal';

interface DestinationProps {
  className?: string;
  onChange?: (value: CrossToken) => void;
  title?: string;
  value?: CrossToken | null;
}

const defaultToken = { ...darwiniaConfig.tokens[0], meta: darwiniaConfig };

export function Destination({
  title,
  value,
  onChange,
  className,
  disabled,
}: DestinationProps & Pick<InputNumberProps, 'disabled'>) {
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState<TokenInfoWithMeta>(defaultToken);

  return (
    <Form.Item label={title} rules={[{ required: true }]} className={'relative w-full ' + className}>
      <>
        <InputNumber<string>
          value={value?.amount}
          onChange={(val: string) => {
            if (onChange) {
              onChange({ amount: val, ...token });
            }
          }}
          disabled={disabled}
          size="large"
          className="h-20 w-full flex items-center"
        />

        <div className="absolute top-0 left-auto right-0 h-20 flex justify-center items-center px-3">
          <Button
            style={{ height: 'auto' }}
            className="flex items-center space-x-2 py-2 bg-gray-800 border-none"
            onClick={() => setVisible(true)}
          >
            <Logo name={token.logo} width={40} height={40} />

            <div className="flex flex-col items-start space-y-px">
              <strong className="font-medium text-sm">{token.symbol}</strong>
              <small className="font-light text-xs opacity-60 capitalize">{token.meta.name}</small>
            </div>

            <Icon name="down" />
          </Button>
        </div>

        <SelectTokenModal
          visible={visible}
          onCancel={() => setVisible(false)}
          onSelect={(val) => {
            setVisible(false);
            setToken(val);
          }}
        />
      </>
    </Form.Item>
  );
}
