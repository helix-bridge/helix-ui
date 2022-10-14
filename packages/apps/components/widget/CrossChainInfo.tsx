import { QuestionCircleOutlined } from '@ant-design/icons';
import { BN } from '@polkadot/util';
import { Form, Tooltip } from 'antd';
import has from 'lodash/has';
import { PropsWithChildren, ReactNode, useMemo } from 'react';
import { useITranslation } from 'shared/hooks/translation';
import { BridgeConfig, ChainConfig, ContractConfig, CrossChainDirection, DailyLimit } from 'shared/model';
import { fromWei, prettyNumber } from 'shared/utils/helper/balance';
import { Bridge } from '../../core/bridge';
import { bridgeCategoryDisplay, isSubstrateDVM } from '../../utils/bridge';
import { CountLoading } from './CountLoading';

type AmountInfo = {
  amount: number;
  symbol: string;
};

interface CrossChainInfoProps {
  bridge: Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>;
  direction: CrossChainDirection;
  fee?: AmountInfo | null;
  hideFee?: boolean;
  extra?: { name: string; content: ReactNode }[];
  isDynamicFee?: boolean;
  dailyLimit?: DailyLimit | null;
}

export function CrossChainInfo({
  bridge,
  fee,
  extra,
  children,
  hideFee,
  dailyLimit,
  direction,
  isDynamicFee = false,
}: PropsWithChildren<CrossChainInfoProps>) {
  const { t } = useITranslation();

  const feeContent = useMemo(() => {
    if (fee) {
      return (
        <Tooltip title={fee.amount} className="cursor-help">
          {fee.amount < 1 ? fee.amount : prettyNumber(fee.amount, { decimal: 3, ignoreZeroDecimal: true })} {fee.symbol}
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

  const dailyLimitContent = useMemo(() => {
    if (has(direction.to.meta, 'specVersion') && !isSubstrateDVM(direction.from.host, direction.to.host)) {
      const limit = dailyLimit && new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday));

      return (
        <div className={`flex justify-between items-center`}>
          <span>{t('Daily limit')}</span>
          {dailyLimit ? (
            <span>
              {fromWei({ value: limit, decimals: direction.to.decimals }, (value) =>
                prettyNumber(value, { ignoreZeroDecimal: true })
              )}
            </span>
          ) : (
            <CountLoading />
          )}
        </div>
      );
    }
    return null;
  }, [dailyLimit, direction.from.host, direction.to.decimals, direction.to.host, direction.to.meta, t]);

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

        {dailyLimitContent}

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
