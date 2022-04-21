import { Radio, Input, Empty, List, Tag, Typography, Button } from 'antd';
import { SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { useState } from 'react';
import { BaseModal } from '../../components/BaseModal';
import Link from 'next/link';

const NoData = () => (
  <div className='dark:bg-antDark mt-3 flex justify-center items-center' style={{ minHeight: '70vh' }}>
    <Empty />
  </div>
);

const HistoryItem = ({ onClaim }: { onClaim: () => void }) => (
  <List.Item className='flex items-center justify-between bg-gray-900 p-3 mb-2 border border-gray-800'>
    <div className='flex space-x-2'>
      <Tag icon={<CheckCircleOutlined />} color='success' className='flex items-center justify-center'>Successed</Tag>
      <div className='flex flex-col'>
        <Typography.Text>23 mins ago</Typography.Text>
        <Typography.Text>From CSC to Darwinia</Typography.Text>
      </div>
      <div className='flex items-center justify-center pl-5'>
        <Button onClick={onClaim}>Claim</Button>
      </div>
    </div>
    <div className='flex items-center space-x-4'>
      <Tag color='warning' className='flex items-center justify-center' style={{ height: 'fit-content' }}>Out</Tag>
      <div className='flex items-center space-x-1'>
        <Image alt='...' src='/image/ring.svg' width={40} height={40} />
        <div className='flex flex-col'>
          <Typography.Text>100,000.87</Typography.Text>
          <Typography.Text>xRING</Typography.Text>
        </div>
      </div>
      <a href='#' rel='noopener noreferrer' target="_bank" >
        <Image alt='...' src='/image/goto.svg' width={30} height={30} />
      </a>
    </div>
  </List.Item>
);

function Page() {
  const [noData, setNoData] = useState<boolean>(false);
  const [visibleClaimConfirm, setVisibleClaimConfirm] = useState<boolean>(false);
  const [visibleTransferDone, setVisibleTransferDone] = useState<boolean>(true);

  return (
    <>
      <div>
        <div className='flex items-center justify-between'>
          <Radio.Group size='large' defaultValue={1} onChange={() => setNoData((prev) => !prev)}>
            <Radio.Button value={1}>All</Radio.Button>
            <Radio.Button value={2}>Pending</Radio.Button>
            <Radio.Button value={3}>Successed</Radio.Button>
            <Radio.Button value={4}>Reverted</Radio.Button>
          </Radio.Group>
          <Input placeholder='Search by Address'  size='large' className='w-2/6' suffix={<SearchOutlined />} />
        </div>
        {noData ? (<NoData />) : (
          <div className='dark:bg-antDark px-6 py-5 mt-4 overflow-auto' style={{ height: '70vh' }}>
            <List
              split={false}
              dataSource={(new Array(20)).fill(1)}
              renderItem={() => <HistoryItem onClaim={() => setVisibleClaimConfirm(true)} />}
            />
          </div>
        )}
      </div>

      <BaseModal
        title='Transfer'
        visible={visibleTransferDone}
        footer={<Button className='w-full' type='primary' size='large' onClick={() => setVisibleTransferDone(false)}>Done</Button>}
        onCancel={() => setVisibleTransferDone(false)}
      >
        <div className='flex flex-col items-center px-9 py-20 space-y-6'>
          <Image alt='...' src='/image/transfer-done.svg' width={133} height={110} />
          <Typography.Paragraph>Transfer Submitted</Typography.Paragraph>
          <Typography.Text className='text-center'>The transaction has been sent, please check the transfer progress in the <Link href='/history'>history</Link>.</Typography.Text>
        </div>
      </BaseModal>

      <BaseModal
        title='Claim'
        visible={visibleClaimConfirm}
        footer={<Button size='large' onClick={() => setVisibleClaimConfirm(false)} className='w-full mb-4 mx-2'>Continue to claim</Button>}
        onCancel={() => setVisibleClaimConfirm(false)}
      >
        <div>
          <Typography.Paragraph className='text-center'>You need to confirm one more transaction to get your funds in your Etherum address. In case of any issue, please reach out to <Typography.Link target='_bank' rel='noopener noreferrer' href='mailto:hello@helixbridge.app'>hello@helixbridge.app</Typography.Link> </Typography.Paragraph>
          <div className='flex justify-center items-center p-8 bg-gray-900 border border-gray-800 space-x-2'>
            <Typography.Text>Estimated Gas Fee:</Typography.Text><Typography.Text strong>0.12 ETH</Typography.Text>
          </div>
        </div>
      </BaseModal>
    </>
  );
}

export default Page;
