import { CheckCircleOutlined } from '@ant-design/icons';
import { List, Tag, Tooltip, Typography } from 'antd';
import { formatDistance, fromUnixTime } from 'date-fns';
import Image from 'next/image';
import { PropsWithChildren, ReactNode } from 'react';
import { CrossChainStatus, CrossChainStatusColor } from 'shared/config/constant';
import { Result } from 'shared/model';

interface HistoryItemProps {
  record: {
    result: Result;
    startTime: number;
  };
  token: {
    amount: string;
    symbol: string;
    logo: string;
  };
  process: ReactNode;
}

export const HistoryItem = ({ record, token, children, process }: PropsWithChildren<HistoryItemProps>) => {
  return (
    <List.Item className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-2 lg:space-y-0 bg-gray-900 p-2 lg:p-3 mb-2 border border-gray-800">
      <div className="flex space-x-px lg:space-x-2">
        <Tag
          icon={<CheckCircleOutlined />}
          className="flex items-center justify-center pr-0 lg:pr-2 text-white"
          style={{ backgroundColor: CrossChainStatusColor[record.result] }}
        >
          <span className="hidden lg:inline">{CrossChainStatus[record.result]}</span>
        </Tag>

        <div className="flex flex-col">
          <Typography.Text>
            {formatDistance(fromUnixTime(record.startTime), new Date(new Date().toUTCString()), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </Typography.Text>

          {process}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <Tag
          color="warning"
          className="flex items-center justify-center order-last lg:order-first bg-yellow-500 text-white font-bold text-sm"
          style={{ height: 'fit-content' }}
        >
          Out
        </Tag>

        <div className="flex items-center gap-4 lg:mx-4">
          <Image alt="..." src={`/image/${token.logo}`} width={40} height={40} />

          <div className={` flex flex-col md:${children ? 'w-28' : 'w-12'} truncate`}>
            <Tooltip title={token.amount}>
              <span className="truncate">{token.amount}</span>
            </Tooltip>
            <span className="capitalize">{token.symbol}</span>
          </div>
        </div>

        <div className="mx-4 lg:mx-0 text-pangolin-main">{children}</div>
      </div>
    </List.Item>
  );
};
