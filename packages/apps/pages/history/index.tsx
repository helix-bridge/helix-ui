import { Radio, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const NoData = () => (
  <div className='dark:bg-antDark p-3 mt-3 flex justify-center items-center' style={{ minHeight: '70vh' }}>
    <Empty />
  </div>
);

function Page() {
  return (
    <div>
      <div className='flex items-center justify-between'>
        <Radio.Group size='large'>
          <Radio.Button className='rounded-sm'>All</Radio.Button>
          <Radio.Button className='rounded-sm'>Pending</Radio.Button>
          <Radio.Button className='rounded-sm'>Successed</Radio.Button>
          <Radio.Button className='rounded-sm'>Reverted</Radio.Button>
        </Radio.Group>
        <Input placeholder='Search by Address'  size='large' className='w-2/6' suffix={<SearchOutlined />} />
      </div>
        <NoData />
    </div>
  );
}

export default Page;
