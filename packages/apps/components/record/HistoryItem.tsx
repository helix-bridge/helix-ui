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

      <div
        className={`grid ${children ? 'grid-cols-3' : 'grid-cols-2'} items-center gap-4 justify-end place-items-center`}
      >
        <Tag
          color="warning"
          className="text-center bg-yellow-500 text-white font-bold w-16"
          style={{ height: 'fit-content' }}
        >
          Out
        </Tag>

        <div className="flex items-center gap-4 lg:mx-4">
          <Image alt="..." src={`/image/${token.logo}`} width={40} height={40} />

          <div>
            <Tooltip title={token.amount}>
              <p className="truncate md:w-40">{token.amount}</p>
            </Tooltip>
            <p className="capitalize">{token.symbol}</p>
          </div>
        </div>

        {children && <div className="mx-4 lg:mx-0 text-pangolin-main">{children}</div>}
      </div>
    </List.Item>
  );
};
