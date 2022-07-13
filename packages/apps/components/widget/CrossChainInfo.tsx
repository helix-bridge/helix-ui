import { CaretDownOutlined } from '@ant-design/icons';
import { Form, Spin, Tooltip, Typography } from 'antd';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Bridge } from 'shared/model';
import { prettyNumber } from 'shared/utils/helper';
import { useITranslation } from '../../hooks';
import { bridgeCategoryDisplay } from '../../utils';

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
  const { t } = useITranslation();
  const [collapse, setCollapse] = useState(true);

  return (
    <Form.Item label={t('Information')} className="relative">
      <div className="w-full flex flex-col justify-center space-y-2 p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <Typography.Text>{t('Bridge Name')}</Typography.Text>
          <Typography.Text>{bridgeCategoryDisplay(bridge?.category)}</Typography.Text>
        </div>

        <div className={`flex justify-between items-center ${hideFee ? 'hidden' : ''}`}>
          <Typography.Text>{t('Transaction Fee')}</Typography.Text>
          {fee ? (
            <Typography.Text>
              <Tooltip title={fee.amount}>{prettyNumber(fee.amount, { decimal: 3 })}</Tooltip>
              <span className="ml-1">{fee.symbol}</span>
            </Typography.Text>
          ) : (
            <Spin spinning size="small"></Spin>
          )}
        </div>

        {extra && (
          <>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCollapse(!collapse)}>
              <span className="flex-1 bg-gray-800 h-px" />
              <CaretDownOutlined
                className={`text-gray-700 transform transition-all duration-300 ${collapse ? '' : 'rotate-180'}`}
              />
              <span className="flex-1 bg-gray-800 h-px" />
            </div>

            {extra.map((item) => (
              <div
                key={item.name}
                className={`justify-between items-center transition-all duration-100 ${collapse ? 'hidden' : 'flex'}`}
              >
                <Typography.Text>{item.name}</Typography.Text>
                {item.content}
              </div>
            ))}
          </>
        )}

        {children}
      </div>
    </Form.Item>
  );
}
