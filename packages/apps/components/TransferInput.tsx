import { Form, Input, Button, Checkbox } from 'antd';

export function TransferInput() {
  return (
    <div className="dark:bg-antDark p-5">
      <Form layout="vertical">
        <Form.Item label="Your send" name="send" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Your receive"
          name="receive"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Sender"
          name="sender"
          tooltip="Select an address sending the transaction."
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Receiver"
          name="receiver"
          tooltip="Please do not fill in the exchange account. After the transaction is confirmed, the account cannot be changed."
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Info" name="info">
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Transfer
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
