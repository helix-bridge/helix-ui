import { Form, Input, Button, Typography, Select } from 'antd';
import { LabelTooltipType } from 'antd/lib/form/FormItemLabel';
import Image from 'next/image';
import styles from './TransferInput.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const TokenSelector = ({ defaultValue }: { defaultValue: number }) => (
  <Select defaultValue={defaultValue} className={cx('token-select')}>
    {new Array(8).fill(1).map((_, index) => (
      <Select.Option key={index} value={index}>
        <div className={cx('flex items-center space-x-2 py-2')}>
          <Image src="/image/ring.svg" alt="..." width={40} height={40} />
          <div className="flex flex-col space-y-0">
            <strong className="font-medium text-sm">RING</strong>
            <small className="font-light text-sm">Darwinia</small>
          </div>
        </div>
      </Select.Option>
    ))}
  </Select>
);

const AmountItem = ({ label, name }: { label: string; name: string; }) => (
  <Form.Item
    label={label}
    name={name}
    rules={[{ required: true, message: 'Please input your username!' }]}
    className="relative"
  >
    <Input size="large" className='h-20' />
    <div className="absolute top-0 left-auto right-0 h-20 flex justify-center items-center px-3">
      <TokenSelector defaultValue={1} />
    </div>
  </Form.Item>
);

const AddressItem = ({ label, name, tooltip }: { label: string, name: string, tooltip: LabelTooltipType }) => (
  <Form.Item
    label={label}
    name={name}
    tooltip={tooltip}
    rules={[{ required: true, message: 'Please input your username!' }]}
  >
    <Select defaultValue="5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1" size="large">
      <Select.Option value="5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1">
        <Typography.Text ellipsis className="w-4/5">
          5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1
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
  return (
    <div className="dark:bg-antDark p-5">
      <Form layout="vertical">
        <AmountItem label="Your send" name="send" />
        <Form.Item noStyle>
          <div className='flex justify-center'>
            <Image alt='...' src='/image/transfer.svg' width={40} height={40} />
          </div>
        </Form.Item>
        <AmountItem label="Your receive" name="receive" />
        <AddressItem label='Sender' name='sender' tooltip="Select an address sending the transaction."  />
        <AddressItem label='Receiver' name='receiver' tooltip="Please do not fill in the exchange account. After the transaction is confirmed, the account cannot be changed."  />
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
  );
}
