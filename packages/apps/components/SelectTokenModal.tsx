import { Button, Input, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { memo } from 'react';
import Image from 'next/image';
import { BaseModal } from './BaseModal';

const Component = ({
  visible,
  onSelect,
  onCancel,
}: {
  visible: boolean;
  onCancel: () => void;
  onSelect: (value: number) => void;
}) => (
  <BaseModal title="Select a token" visible={visible} footer={null} width={540} onCancel={onCancel}>
    <Input suffix={<SearchOutlined />} size="large" placeholder="Search Symbol or Paste Contract Address" />
    <div className="mt-1">
      {/* eslint-disable-next-line no-magic-numbers */}
      {new Array(9).fill(1).map((_, index) => (
        <Button key={index} className="mt-2 mr-2" size="small">
          Chain
        </Button>
      ))}
    </div>
    <div className="max-h-96 overflow-auto mt-5">
      <div className="flex flex-col space-y-2">
        {/* eslint-disable-next-line no-magic-numbers */}
        {new Array(9).fill(1).map((_, index) => (
          <div
            className="flex items-center justify-between border border-gray-800 bg-gray-900 py-3 px-2 cursor-pointer transition-all duration-300 hover:bg-gray-800"
            key={index}
            onClick={() => onSelect(index)}
          >
            <div className="flex items-center space-x-2">
              <Image alt="..." src="/image/usdt.svg" width={36} height={36} />
              <Typography.Text>USDT</Typography.Text>
              <Tag color="processing">Ethereum</Tag>
            </div>
            <Typography.Text>3,243.4387</Typography.Text>
          </div>
        ))}
      </div>
    </div>
  </BaseModal>
);

export const SelectTokenModal = memo(Component);
