import { Form, Input, Button, Typography, Select } from 'antd';

export function TransferInput() {
  return (
    <div className="dark:bg-antDark p-5">
      <Form layout="vertical">
        <Form.Item label="Your send" name="send" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input size='large' />
        </Form.Item>
        <Form.Item
          label="Your receive"
          name="receive"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input size='large' />
        </Form.Item>
        <Form.Item
          label="Sender"
          name="sender"
          tooltip="Select an address sending the transaction."
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Select defaultValue='5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1' size="large">
            <Select.Option value='5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1'>
              <Typography.Text ellipsis className="w-4/5">5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat1</Typography.Text>
            </Select.Option>
            <Select.Option value='5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat2'>
              <Typography.Text ellipsis className="w-4/5">5G1gFmXNy9rwYqryzTkyM4x5BSTB9cG4fYgqPz1SZ9VPMnat2</Typography.Text>
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Receiver"
          name="receiver"
          tooltip="Please do not fill in the exchange account. After the transaction is confirmed, the account cannot be changed."
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input size='large' />
        </Form.Item>
        <Form.Item label="Info" name="info" className="relative">
          <Input disabled className="h-20" />
          <div className='absolute top-0 left-0 h-20 w-full flex flex-col justify-center space-y-2 px-4'>
            <div className='flex justify-between items-center'>
              <Typography.Text>Bridge Name</Typography.Text>
              <Typography.Text>Helix Bridge</Typography.Text>
            </div>
            <div className='flex justify-between items-center'>
              <Typography.Text>Transaction Fee</Typography.Text>
              <Typography.Text>50 RING</Typography.Text>
            </div>
          </div>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
          <Button type="primary" htmlType="submit" className='w-full' size='large'>
            Transfer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
