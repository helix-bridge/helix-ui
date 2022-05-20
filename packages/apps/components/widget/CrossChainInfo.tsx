import { Form, Spin, Typography } from 'antd';
import { PropsWithChildren, ReactNode } from 'react';
import { Bridge } from 'shared/model';

type AmountInfo =
  | {
      amount: string;
      symbol: string;
    }
  | null
  | undefined;

interface CrossChainInfoProps {
  bridge: Bridge;
  fee: AmountInfo;
  hideFee?: boolean;
  extra?: { name: string; content: ReactNode }[];
}

export function CrossChainInfo({ bridge, fee, extra, children, hideFee }: PropsWithChildren<CrossChainInfoProps>) {
  return (
    <Form.Item label="Info" className="relative">
      <div className="w-full flex flex-col justify-center space-y-2 p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <Typography.Text>Bridge Name</Typography.Text>
          <Typography.Text className="capitalize">{bridge?.category}</Typography.Text>
        </div>

        <div className={`flex justify-between items-center ${hideFee ? 'hidden' : ''}`}>
          <Typography.Text>Transaction Fee</Typography.Text>
          {fee ? (
            <Typography.Text>
              {fee.amount} {fee.symbol}
            </Typography.Text>
          ) : (
            <Spin spinning size="small"></Spin>
          )}
        </div>

        {extra &&
          extra.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <Typography.Text>{item.name}</Typography.Text>
              {item.content}
            </div>
          ))}

        {children}
      </div>
    </Form.Item>
  );
}
