import { Radio, Input, Empty, List, Tag, Typography, Button } from 'antd';
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useState } from 'react';
import { ClaimConfirmModal } from '../../components/ClaimConfirmModal';

const NoData = () => (
  <div className="dark:bg-antDark mt-3 flex justify-center items-center" style={{ minHeight: '70vh' }}>
    <Empty />
  </div>
);

const HistoryItem = ({ onClaim }: { onClaim: () => void }) => (
  <List.Item className="flex items-center justify-between bg-gray-900 p-3 mb-2 border border-gray-800">
    <div className="flex space-x-2">
      <Tag icon={<CheckCircleOutlined />} color="success" className="flex items-center justify-center">
        Successed
      </Tag>
      <div className="flex flex-col">
        <Typography.Text>23 mins ago</Typography.Text>
        <Typography.Text>From CSC to Darwinia</Typography.Text>
      </div>
      <div className="flex items-center justify-center pl-5">
        <Button onClick={onClaim}>Claim</Button>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <Tag color="warning" className="flex items-center justify-center" style={{ height: 'fit-content' }}>
        Out
      </Tag>
      <div className="flex items-center space-x-1">
        <Image alt="..." src="/image/ring.svg" width={40} height={40} />
        <div className="flex flex-col">
          <Typography.Text>100,000.87</Typography.Text>
          <Typography.Text>xRING</Typography.Text>
        </div>
      </div>
      <a href="#" rel="noopener noreferrer" target="_bank">
        <Image alt="..." src="/image/goto.svg" width={30} height={30} />
      </a>
    </div>
  </List.Item>
);

function Page() {
  const [noData, setNoData] = useState<boolean>(false);
  const [visibleClaimConfirm, setVisibleClaimConfirm] = useState<boolean>(false);

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <Radio.Group size="large" defaultValue={1} onChange={() => setNoData((prev) => !prev)}>
            <Radio.Button value={1}>All</Radio.Button>
            <Radio.Button value={2}>Pending</Radio.Button>
            <Radio.Button value={3}>Successed</Radio.Button>
            <Radio.Button value={4}>Reverted</Radio.Button>
          </Radio.Group>
          <Input placeholder="Search by Address" size="large" className="w-2/6" suffix={<SearchOutlined />} />
        </div>
        {noData ? (
          <NoData />
        ) : (
          <div className="dark:bg-antDark px-6 py-5 mt-4 overflow-auto" style={{ height: '70vh' }}>
            <List
              split={false}
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
