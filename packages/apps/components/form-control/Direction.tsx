import { PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { BridgeStatus, CrossChainDirection, CustomFormControlProps, HashInfo } from 'shared/model';
import { fromWei, prettyNumber, largeNumber } from 'shared/utils/helper/balance';
import { updateStorage } from 'shared/utils/helper/storage';
import { isKton } from 'shared/utils/helper/validator';
import { getBridge, isEthereumDarwinia, isSubstrateDVMSubstrateDVM } from 'utils/bridge';
import { CountLoading } from '../widget/CountLoading';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection> & {
  initial: CrossChainDirection;
  fee: { amount: number; symbol: string } | null;
  balances: BN[] | null;
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
  balances,
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

  // eslint-disable-next-line complexity
  const iBalance = useMemo(() => {
    if (!balances) {
      return BN_ZERO;
    }

    if (isEthereumDarwinia(data.from.host, data.to.host)) {
      const [ring, kton] = balances as BN[];

      return isKton(data.from.symbol) ? kton : ring;
    }

    if (isSubstrateDVMSubstrateDVM(data.from.host, data.to.host)) {
      const [erc20, native] = balances;

      return data.from.type === 'native' ? native : erc20;
    }

    return balances[0];
  }, [balances, data.from.host, data.from.symbol, data.from.type, data.to.host]);

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
      />

      {isBalanceLoading && (
        <div className="absolute right-0 top-1 cursor-pointer space-x-2 text-xs">
          <CountLoading />
        </div>
      )}

      {iBalance && !isBalanceLoading && (
        <span className="absolute right-0 top-1 cursor-pointer space-x-2 text-xs flex items-center">
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
            className="hover:text-blue-400 transition-all duration-300"
          />
        </span>
      )}

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
