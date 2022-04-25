import { CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input, List, Tag, Typography } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import { ClaimConfirmModal } from '../../components/ClaimConfirmModal';

const NoData = () => (
  <div className="dark:bg-antDark mt-3 flex justify-center items-center" style={{ minHeight: '70vh' }}>
    <Empty />
  </div>
);

const HistoryItem = ({ onClaim }: { onClaim: () => void }) => (
  <List.Item className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-2 lg:space-y-0 bg-gray-900 p-2 lg:p-3 mb-2 border border-gray-800">
    <div className="flex space-x-px lg:space-x-2">
      <Tag
        icon={<CheckCircleOutlined />}
        color="success"
        className="flex items-center justify-center pr-0 lg:pr-2 bg-green-600 text-white"
      >
        <span className="hidden lg:inline">Successed</span>
      </Tag>
      <div className="flex flex-col">
        <Typography.Text>23 mins ago</Typography.Text>
        <Typography.Text>From CSC to Darwinia</Typography.Text>
      </div>
      <div className="flex items-center justify-center pl-5">
        <Button onClick={onClaim}>Claim</Button>
      </div>
    </div>
    <div className="flex items-center">
      <Tag
        color="warning"
        className="flex items-center justify-center order-last lg:order-first bg-yellow-500 text-white font-bold text-sm"
        style={{ height: 'fit-content' }}
      >
        Out
      </Tag>
      <div className="flex items-center space-x-1 lg:mx-4">
        <Image alt="..." src="/image/ring.svg" width={40} height={40} />
        <div className="flex flex-col">
          <Typography.Text>100,000.87</Typography.Text>
          <Typography.Text>xRING</Typography.Text>
        </div>
      </div>
      <a href="#" rel="noopener noreferrer" target="_bank" className="mx-4 lg:mx-0">
        <Image alt="..." src="/image/goto.svg" width={30} height={30} />
      </a>
    </div>
  </List.Item>
);

const HistoryFilter = ({ currentValue, onChange }: { currentValue: number; onChange: (value: number) => void }) => (
  <div className="flex justify-between items-center space-x-2 w-full lg:w-auto">
    {['All', 'Pending', 'Success', 'Reverted'].map((value, index) => (
      <Button type={currentValue === index ? 'primary' : 'default'} onClick={() => onChange(index)} key={index}>
        {value}
      </Button>
    ))}
  </div>
);

function Page() {
  const [noData, setNoData] = useState<boolean>(false);
  const [filter, setFilter] = useState(0);
  const [visibleClaimConfirm, setVisibleClaimConfirm] = useState<boolean>(false);

  return (
    <>
      <div>
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 items-center justify-between">
          <HistoryFilter
            currentValue={filter}
            onChange={(value) => {
              setNoData((prev) => !prev);
              setFilter(value);
            }}
          />
          <Input placeholder="Search by Address" size="large" className="w-full lg:w-2/6" suffix={<SearchOutlined />} />
        </div>
        {noData ? (
          <NoData />
        ) : (
          <div className="dark:bg-antDark px-2 py-3 lg:px-6 lg:py-5 mt-4 overflow-auto" style={{ height: '70vh' }}>
            <List
              split={false}
              // eslint-disable-next-line no-magic-numbers
              dataSource={new Array(20).fill(1)}
              renderItem={() => <HistoryItem onClaim={() => setVisibleClaimConfirm(true)} />}
            />
          </div>
        )}
      </div>

      <ClaimConfirmModal
        visible={visibleClaimConfirm}
        onOk={() => setVisibleClaimConfirm(false)}
        onCancel={() => setVisibleClaimConfirm(false)}
      />
    </>
  );
}

export default Page;
