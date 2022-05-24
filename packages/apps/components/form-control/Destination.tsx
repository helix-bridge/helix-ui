import { Button, Form, InputNumber, InputNumberProps } from 'antd';
import { useState } from 'react';
import { Icon } from 'shared/components/widget/Icon';
import { Logo } from 'shared/components/widget/Logo';
import { CrossToken, TokenInfoWithMeta } from 'shared/model';
import { getDisplayName } from 'shared/utils/network';
import { SelectTokenModal } from './SelectTokenModal';

interface DestinationProps {
  className?: string;
  onChange?: (value: CrossToken) => void;
  title?: string;
  value: CrossToken;
  fromToken?: TokenInfoWithMeta;
}

export function Destination({
  title,
  value,
  onChange,
  className,
  disabled,
  fromToken,
}: DestinationProps & Pick<InputNumberProps, 'disabled'>) {
  const [visible, setVisible] = useState(false);

  return (
    <Form.Item label={title} className={'relative w-full ' + className}>
      <>
        <InputNumber<string>
          value={value?.amount}
          onChange={(val: string) => {
            if (onChange) {
              onChange({ ...value, amount: val });
            }
          }}
          disabled={disabled}
          size="large"
          style={{
            height: '5rem',
            width: '100%',
            display: 'flex',
          }}
          className="h-20 w-full flex items-center destination"
        />

        <div className="absolute top-0 left-auto right-0 h-20 flex justify-center items-center px-3">
          <Button
            style={{ height: 'auto' }}
            className="flex items-center space-x-2 py-2 bg-gray-800 border-none"
            onClick={() => setVisible(true)}
          >
            <Logo name={value.logo} width={40} height={40} />

            <div className="flex flex-col items-start space-y-px w-16 text-left">
              <strong className="font-medium text-sm truncate w-full">{value.symbol}</strong>
              <small
                className="font-light text-xs opacity-60 w-full capitalize truncate"
                title={getDisplayName(value.meta)}
              >
                {getDisplayName(value.meta)}
              </small>
            </div>

            <Icon name="down" />
          </Button>
        </div>

        <SelectTokenModal
          visible={visible}
          fromToken={fromToken}
          onCancel={() => setVisible(false)}
          onSelect={(val) => {
            setVisible(false);
            if (onChange) {
              onChange({ ...val, amount: value.amount });
            }
          }}
        />
      </>
    </Form.Item>
  );
}
