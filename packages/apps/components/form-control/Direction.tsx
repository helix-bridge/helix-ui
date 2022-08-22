import { PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { BridgeStatus, CrossChainDirection, CustomFormControlProps, HashInfo } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { fromWei, isKton, isRing, largeNumber, prettyNumber, updateStorage } from 'shared/utils/helper';
import { CountLoading } from '../widget/CountLoading';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection> & {
  initial: CrossChainDirection;
  fee: { amount: number; symbol: string } | null;
  balance: BN | BN[] | null;
  isBalanceLoading: boolean;
  onRefresh?: () => void;
};

const MILLION = 1e6;

const calcToAmount = (payment: string, paymentFee: number | null) => {
  if (paymentFee === null) {
    return '';
  }

  const amount = Number(payment) - paymentFee;

  return amount >= 0 ? String(amount) : '';
};

// eslint-disable-next-line complexity
export function Direction({
  value,
  initial,
  onChange,
  balance,
  onRefresh,
  isBalanceLoading = false,
  fee = { amount: 0, symbol: '' },
}: DirectionProps) {
  const data = value ?? initial;
  const { t } = useTranslation();
  const [bridgetStatus, setBridgetStatus] = useState<null | BridgeStatus>(null);

  const triggerChange = useCallback(
    (val: CrossChainDirection) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  const iBalance = useMemo(() => {
    if (Array.isArray(balance)) {
      const [ring, kton] = balance;

      if (isRing(data.from.symbol)) {
        return ring;
      }

      if (isKton(data.from.symbol)) {
        return kton;
      }

      return null;
    }

    return balance;
  }, [balance, data.from.symbol]);

  useEffect(() => {
    const { from, to } = data;
    const info = {
      from: from.name,
      to: to.name,
    } as HashInfo;

    if (from && to) {
      const bridge = getBridge({ from, to });

      setBridgetStatus(bridge.status);
    } else {
      setBridgetStatus(null);
    }

    updateStorage(info);
  }, [data]);

  useEffect(() => {
    triggerChange({
      from: data.from,
      to: {
        ...data.to,
        amount:
          data.from.amount !== '' && fee?.symbol === data.from.symbol
            ? calcToAmount(data.from.amount, fee.amount)
            : data.from.amount,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee?.amount, fee?.symbol]);

  return (
    <div className={`relative flex justify-between items-center flex-col`}>
      <Destination
        title={t('From')}
        balance={
          isBalanceLoading ? (
            <div className="cursor-pointer space-x-2 text-xs h-5">
              <CountLoading />
            </div>
          ) : iBalance ? (
            <span className="cursor-pointer space-x-2 text-xs flex items-center h-5">
              <Tooltip
                title={
                  iBalance.gt(new BN(MILLION))
                    ? fromWei({ value: iBalance, decimals: data.from.decimals }, prettyNumber)
                    : ''
                }
              >
                <span
                  onClick={() => {
                    const { from } = data;
                    const amount = fromWei({ value: iBalance, decimals: data.from.decimals });

                    if (amount !== from.amount) {
                      triggerChange({
                        from: { ...from, amount },
                        to: {
                          ...data.to,
                          amount: fee && fee.symbol === from.symbol ? calcToAmount(amount, fee.amount) : amount,
                        },
                      });
                    }
                  }}
                >
                  {fromWei(
                    { value: iBalance, decimals: data.from.decimals },
                    (val: string) => (+val > MILLION ? largeNumber(val) : val),
                    (val: string) => prettyNumber(val, { ignoreZeroDecimal: true, decimal: 3 })
                  )}
                  <span className="ml-2">{data.from.symbol}</span>
                </span>
              </Tooltip>

              <ReloadOutlined
                onClick={() => {
                  if (onRefresh) {
                    onRefresh();
                  }
                }}
                className="hover:text-blue-400 transform transition-all duration-300"
              />
            </span>
          ) : null
        }
        value={data.from}
        onChange={(from) => {
          triggerChange({
            from,
            to: {
              ...data.to,
              amount: fee && fee.symbol === from.symbol ? calcToAmount(from.amount, fee.amount) : from.amount,
            },
          });
        }}
        className="form-item-destination"
      />

      {bridgetStatus === 'pending' ? (
        <PauseCircleOutlined className="w-10 h-10 mx-auto" />
      ) : (
        <Icon
          onClick={() => {
            const { from, to } = data;

            triggerChange({ from: { ...to, amount: '' }, to: { ...from, amount: '' } });
          }}
          name="switch"
          className="transform rotate-90 cursor-pointer w-8 h-8 translate-y-3"
        />
      )}

      <Destination
        title={t('To')}
        value={data.to}
        fromToken={data.from}
        disabled
        onChange={(to) => {
          triggerChange({ to, from: data.from });
        }}
      />
    </div>
  );
}
