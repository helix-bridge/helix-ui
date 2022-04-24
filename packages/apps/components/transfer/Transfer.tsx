import { Icon } from '@helix/shared/components/widget/Icon';
import { Button, Form, Input, InputNumber, InputNumberProps, Typography } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import { TransferConfirmModal } from './TransferConfirmModal';
import { TransferDoneModal } from './TransferDoneModal';
import { SelectTokenModal } from './SelectTokenModal';

type AmountItemContentProps = InputNumberProps & {
  value?: { amount: string; tokenIndex: number };
  onChange?: (value: unknown) => void;
};

const AmountItemContent = ({ value, onChange, disabled }: AmountItemContentProps) => {
  const [visible, setVisible] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(value?.tokenIndex ?? 0);

  const triggerChange = (amount: string) => {
    if (onChange) {
      onChange({ amount, tokenIndex });
    }
  };

  return (
    <>
      <InputNumber<string>
        value={value?.amount}
        onChange={triggerChange}
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
          <Image src="/image/ring.svg" alt="..." width={40} height={40} />
          <div className="flex flex-col items-start space-y-px">
            <strong className="font-medium text-sm">RING</strong>
            <small className="font-light text-xs opacity-60">Darwinia</small>
          </div>
          <Icon name="down" />
        </Button>
      </div>

      <SelectTokenModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onSelect={(val) => {
          setVisible(false);
          setTokenIndex(val);
        }}
      />
    </>
  );
};

export function Transfer() {
  const [visibleTransferDone, setVisibleTransferDone] = useState(false);
  const [visibleTransferConfirm, setVisibleTransferConfirm] = useState(false);

  const handleFinish = (value: unknown) => {
    console.log(value);
    setVisibleTransferConfirm(true);
    setTimeout(() => {
      setVisibleTransferConfirm(false);
      setVisibleTransferDone(true);
      // eslint-disable-next-line no-magic-numbers
    }, 1500);
  };

  return (
    <>
      <div className="dark:bg-antDark p-5">
        <Form
          layout="vertical"
          initialValues={{
            send: { amount: '123.456', tokenIndex: 1 },
            receive: { amount: '456.789', tokenIndex: 1 },
          }}
          onFinish={handleFinish}
        >
          <Form.Item label="Your send" name="send" rules={[{ required: true }]}>
            <AmountItemContent />
          </Form.Item>

          <Form.Item>
            <Icon name="switch" className="w-10 h-10 mx-auto transform rotate-90" />
          </Form.Item>

          <Form.Item label="Your receive" name="receive">
            <AmountItemContent disabled />
          </Form.Item>

          <Form.Item label="Info" name="info" className="relative">
            <Input disabled className="h-20" />
            <div className="absolute top-0 left-0 h-20 w-full flex flex-col justify-center space-y-2 px-4">
              <div className="flex justify-between items-center">
                <Typography.Text>Bridge Name</Typography.Text>
                <Typography.Text>Helix Bridge</Typography.Text>
              </div>
              <div className="flex justify-between items-center">
                <Typography.Text>Transaction Fee</Typography.Text>
                <Typography.Text>50 RING</Typography.Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Transfer
            </Button>
          </Form.Item>
        </Form>
      </div>

      <TransferDoneModal
        visible={visibleTransferDone}
        onOk={() => setVisibleTransferDone(false)}
        onCancel={() => setVisibleTransferDone(false)}
      />
      <TransferConfirmModal
        visible={visibleTransferConfirm}
        onOk={() => setVisibleTransferConfirm(false)}
        onCancel={() => setVisibleTransferConfirm(false)}
      />
    </>
  );
}
