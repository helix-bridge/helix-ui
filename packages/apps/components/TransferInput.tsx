import { Form, Input, InputNumber, Button, Typography, Select } from 'antd';
import { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import Image from 'next/image';
import { SelectTokenModal } from './SelectTokenModal';
import { TransferDoneModal } from './TransferDoneModal';
import { TransferConfirmModal } from './TransferConfirmModal';
import { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';

const AmountItemContent = ({ value, onChange }: { value?: { amount: string; tokenIndex: number; }; onChange?: (value: unknown) => void;}) => {
  const [visible, setVisible] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(value?.tokenIndex ?? 0);

  const triggerChange = (amount: string) => {
    onChange && onChange({ amount, tokenIndex });
  };

  return (
    <>
      <InputNumber<string> value={value?.amount} onChange={triggerChange} size="large" className='h-20 w-full flex items-center' />
      <div className="absolute top-0 left-auto right-0 h-20 flex justify-center items-center px-3">
        <Button style={{ height: 'auto' }} className='flex items-center space-x-2 py-2 bg-gray-800 border-none' onClick={() => setVisible(true)}>
            <Image src="/image/ring.svg" alt="..." width={40} height={40} />
            <div className="flex flex-col items-start space-y-px">
              <strong className="font-medium text-sm">RING</strong>
              <small className="font-light text-xs opacity-60">Darwinia</small>
            </div>
            <DownOutlined />
        </Button>
      </div>
      <SelectTokenModal visible={visible} onCancel={() => setVisible(false)} onSelect={(value) => {
        setVisible(false);
        setTokenIndex(value);
      }} />
    </>
  )
};

const AmountItem = ({ label, name }: { label: string; name: string;}) => (
  <Form.Item
    label={label}
    name={name}
    rules={[{ required: true, message: 'Please input your username!' }]}
    className="relative"
  >
    <AmountItemContent />
  </Form.Item>
);

const AddressItem = ({ label, name, tooltip }: { label: string; name: string; tooltip: LabelTooltipType }) => (
  <Form.Item
    label={label}
    name={name}
    tooltip={tooltip}
    rules={[{ required: true, message: 'Please input your username!' }]}
  >
    <Select size="large">
      <Select.Option value="5B1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1">
        <Typography.Text ellipsis className="w-4/5">
          5B1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1
        </Typography.Text>
      </Select.Option>
      <Select.Option value="5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat2">
        <Typography.Text ellipsis className="w-4/5">
          5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat2
        </Typography.Text>
      </Select.Option>
    </Select>
  </Form.Item>
);

export function TransferInput() {
  const [visibleTransferDone, setVisibleTransferDone] = useState(false);
  const [visibleTransferConfirm, setVisibleTransferConfirm] = useState(false);

  const handleFinish = (value: unknown) => {
    console.log(value);
    setVisibleTransferConfirm(true);
    setTimeout(() => {
      setVisibleTransferConfirm(false);
      setVisibleTransferDone(true);
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
            sender: '5B1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1',
            receiver: '5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat2',
          }}
          onFinish={handleFinish}
        >
          <AmountItem label="Your send" name="send" />
          <Form.Item noStyle>
            <div className="flex justify-center">
              <Image alt="..." src="/image/transfer.svg" width={40} height={40} />
            </div>
          </Form.Item>
          <AmountItem label="Your receive" name="receive" />
          <AddressItem label="Sender" name="sender" tooltip="Select an address sending the transaction." />
          <AddressItem
            label="Receiver"
            name="receiver"
            tooltip="Please do not fill in the exchange account. After the transaction is confirmed, the account cannot be changed."
          />
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

      <TransferDoneModal visible={visibleTransferDone} onOk={() => setVisibleTransferDone(false)} onCancel={() => setVisibleTransferDone(false)} />
      <TransferConfirmModal visible={visibleTransferConfirm} onOk={() => setVisibleTransferConfirm(false)} onCancel={() => setVisibleTransferConfirm(false)} />
    </>
  );
}
