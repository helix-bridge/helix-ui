import { QuestionCircleOutlined } from '@ant-design/icons';
import { BN } from '@polkadot/util';
import { Form, Tooltip } from 'antd';
import { PropsWithChildren, ReactNode, useMemo } from 'react';
import { useITranslation } from 'shared/hooks/translation';
import { BridgeConfig, ChainConfig, ContractConfig, CrossChainDirection, DailyLimit } from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { Bridge, TokenWithAmount } from '../../core/bridge';
import { useApi } from '../../providers/api';
import { bridgeCategoryDisplay } from '../../utils/bridge';
import { CountLoading } from './CountLoading';

interface CrossChainInfoProps {
  bridge: Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig>;
  direction: CrossChainDirection;
  fee?: TokenWithAmount | null;
  extra?: { name: string; content: ReactNode }[];
  isDynamicFee?: boolean;
  dailyLimit?: DailyLimit | null;
  allowance?: BN | null;
}

export function CrossChainInfo({
  bridge,
  fee,
  extra,
  children,
  dailyLimit,
  direction,
  allowance,
  isDynamicFee = false,
}: PropsWithChildren<CrossChainInfoProps>) {
  const { t } = useITranslation();
  const { departureConnection } = useApi();

  const feeContent = useMemo(() => {
    if (fee) {
      return (
        <Tooltip title={fromWei(fee)} className="cursor-help">
          {fee.amount.lt(new BN(toWei({ value: 1, decimals: fee.decimals })))
            ? fromWei(fee)
            : prettyNumber(fromWei(fee), { decimal: 3, ignoreZeroDecimal: true })}{' '}
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

  const dailyLimitContent = useMemo(() => {
    if (bridge.getDailyLimit) {
      const limit = dailyLimit && new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday));

      return (
        <div className={`flex justify-between items-center`}>
          <span>{t('Daily limit')}</span>
          {dailyLimit ? (
            <span>
              {fromWei({ value: limit, decimals: direction.to.decimals }, (value) =>
                prettyNumber(value, { ignoreZeroDecimal: true })
              )}
              <span className="ml-1">{direction.from.symbol}</span>
            </span>
          ) : (
            <CountLoading />
          )}
        </div>
      );
    }

    return null;
  }, [bridge.getDailyLimit, dailyLimit, direction.from.symbol, direction.to.decimals, t]);

  const allowanceContent = useMemo(() => {
    if (bridge.getAllowancePayload && direction.from.type !== 'native' && departureConnection.type === 'metamask') {
      return (
        <div className={`justify-between items-center hidden`}>
          <span>{t('Allowance')}</span>
          {allowance ? (
            <div>
              <span>
                {fromWei({ value: allowance }, largeNumber, (num: string) =>
                  prettyNumber(num, { ignoreZeroDecimal: true })
                )}
              </span>
              <span className="ml-1">{direction.from.symbol}</span>
            </div>
          ) : (
            <CountLoading />
          )}
        </div>
      );
    }

    return null;
  }, [allowance, bridge.getAllowancePayload, departureConnection.type, direction.from.symbol, direction.from.type, t]);

  return (
    <Form.Item label={t('Information')} className="relative">
      <div className="w-full flex flex-col justify-center space-y-2 p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <span>{t('Bridge Name')}</span>
          <span>{bridgeCategoryDisplay(bridge?.category)}</span>
        </div>

        <div className={`flex justify-between items-center`}>
          <span>{t('Transaction Fee')}</span>
          {feeContent}
        </div>

        {dailyLimitContent}
        {allowanceContent}

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
