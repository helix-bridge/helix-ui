import { CheckCircleOutlined } from '@ant-design/icons';
import { List, Tag, Typography, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

export const HistoryItem = ({ onClaim }: { onClaim?: () => void }) => {
  const { t } = useTranslation();

  return (
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
          <Button onClick={onClaim}>{t('Claim')}</Button>
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
          <Image alt="..." src="/image/token-ring.svg" width={40} height={40} />
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
};
