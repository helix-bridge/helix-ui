import { Form, Spin, Typography } from 'antd';
import { PropsWithChildren } from 'react';
import { Bridge } from 'shared/model';

interface CrossChainInfoProps {
  bridge: Bridge;
  fee: {
    amount: string;
    symbol: string;
  } | null;
}

export function CrossChainInfo({ bridge, fee, children }: PropsWithChildren<CrossChainInfoProps>) {
  return (
    <Form.Item label="Info" className="relative">
      <div className="h-20 w-full flex flex-col justify-center space-y-2 px-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <Typography.Text>Bridge Name</Typography.Text>
          <Typography.Text className="capitalize">{bridge?.category}</Typography.Text>
        </div>

        <div className="flex justify-between items-center">
          <Typography.Text>Transaction Fee</Typography.Text>
          {fee ? (
            <Typography.Text>
              {fee.amount} {fee.symbol}
            </Typography.Text>
          ) : (
            <Spin spinning size="small"></Spin>
          )}
        </div>

        {children}
      </div>
    </Form.Item>
  );
}
