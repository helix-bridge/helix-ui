import { CaretDownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Spin, Tooltip, Typography } from 'antd';
import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { Bridge } from 'shared/model';
import { prettyNumber } from 'shared/utils/helper';
import { useITranslation } from '../../hooks';
import { bridgeCategoryDisplay } from '../../utils';

type AmountInfo = {
  amount: string;
  symbol: string;
};

interface CrossChainInfoProps {
  bridge: Bridge;
  fee?: AmountInfo | null;
  hideFee?: boolean;
  extra?: { name: string; content: ReactNode }[];
  isDynamicFee?: boolean;
}

export function CrossChainInfo({
  bridge,
  fee,
  extra,
  children,
  hideFee,
  isDynamicFee = false,
}: PropsWithChildren<CrossChainInfoProps>) {
  const { t } = useITranslation();
  const [collapse, setCollapse] = useState(true);

  const feeContent = useMemo(() => {
    if (fee) {
      return (
        <Typography.Text className="text-white">
          <Tooltip title={fee.amount} className="cursor-help">
            {prettyNumber(fee.amount, { decimal: 3, ignoreZeroDecimal: true })} {fee.symbol}
          </Tooltip>
        </Typography.Text>
      );
    }

    return isDynamicFee ? (
      <Tooltip title={t('The transaction fee is dynamic, need some conditions to estimate it')}>
        <QuestionCircleOutlined className="cursor-pointer" />
      </Tooltip>
    ) : (
      <Spin spinning size="small"></Spin>
    );
  }, [fee, isDynamicFee, t]);

  return (
    <Form.Item label={<span className="text-white">{t('Information')}</span>} className="relative">
      <div className="w-full flex flex-col justify-center space-y-2 p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <Typography.Text className="text-white">{t('Bridge Name')}</Typography.Text>
          <Typography.Text className="text-white">{bridgeCategoryDisplay(bridge?.category)}</Typography.Text>
        </div>

        <div className={`flex justify-between items-center ${hideFee ? 'hidden' : ''}`}>
          <Typography.Text className="text-white">{t('Transaction Fee')}</Typography.Text>
          {feeContent}
        </div>

        {extra && (
          <>
            <div
              className="flex items-center gap-2 cursor-pointer"
              data-testid="toggle-btn"
              onClick={() => setCollapse(!collapse)}
            >
              <span className="flex-1 bg-transparent h-px" />
              <CaretDownOutlined
                className={`text-gray-700 transform transition-all duration-300 ${collapse ? '' : 'rotate-180'}`}
              />
              <span className="flex-1 bg-transparent h-px" />
            </div>

            {extra.map((item) => (
              <div
                key={item.name}
                data-testid={item.name}
                className={`justify-between items-center transition-all duration-100 ${collapse ? 'hidden' : 'flex'}`}
              >
                <Typography.Text className="text-white">{item.name}</Typography.Text>
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
