import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip } from 'antd';
import { PropsWithChildren, ReactNode, useMemo } from 'react';
import { useITranslation } from 'shared/hooks/translation';
import { BridgeBase } from 'shared/model';
import { prettyNumber } from 'shared/utils/helper/balance';
import { bridgeCategoryDisplay } from '../../utils/bridge';
import { CountLoading } from './CountLoading';

type AmountInfo = {
  amount: string;
  symbol: string;
};

interface CrossChainInfoProps {
  bridge: BridgeBase;
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

  const feeContent = useMemo(() => {
    if (fee) {
      return (
        <Tooltip title={fee.amount} className="cursor-help">
          {Number(fee.amount) < 1 ? fee.amount : prettyNumber(fee.amount, { decimal: 3, ignoreZeroDecimal: true })}{' '}
          {fee.symbol}
        </Tooltip>
      );
    }

    return isDynamicFee ? (
      <Tooltip title={t('The transaction fee is dynamic, need some conditions to estimate it')}>
        <QuestionCircleOutlined className="cursor-pointer" />
      </Tooltip>
    ) : (
      <CountLoading />
    );
  }, [fee, isDynamicFee, t]);

  return (
    <Form.Item label={t('Information')} className="relative">
      <div className="w-full flex flex-col justify-center space-y-2 p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <span>{t('Bridge Name')}</span>
          <span>{bridgeCategoryDisplay(bridge?.category)}</span>
        </div>

        <div className={`flex justify-between items-center ${hideFee ? 'hidden' : ''}`}>
          <span>{t('Transaction Fee')}</span>
          {feeContent}
        </div>

        {extra && (
          <>
            {extra.map((item) => (
              <div
                key={item.name}
                data-testid={item.name}
                className={`justify-between items-center transition-all duration-100 flex`}
              >
                <span className="whitespace-nowrap">{item.name}</span>
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
