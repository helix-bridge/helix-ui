import { Button, ButtonProps, Form } from 'antd';

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
