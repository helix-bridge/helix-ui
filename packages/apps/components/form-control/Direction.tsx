import { PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import {
  BridgeStatus,
  Chain,
  CrossChainDirection,
  CrossToken,
  CustomFormControlProps,
  HashInfo,
  Network,
} from 'shared/model';
import { fromWei, largeNumber, prettyNumber } from 'shared/utils/helper/balance';
import { updateStorage } from 'shared/utils/helper/storage';
import { isKton } from 'shared/utils/helper/validator';
import { getBridge, isEthereumDarwinia, isSubstrateDVM2Ethereum, isSubstrateDVMSubstrateDVM } from 'utils/bridge';
import { CountLoading } from '../widget/CountLoading';
import { Destination } from './Destination';

type Amount = { amount: number; symbol: string };

type DirectionProps = CustomFormControlProps<CrossChainDirection<CrossToken<Chain>, CrossToken<Chain>>> & {
  initial: CrossChainDirection<CrossToken<Chain>, CrossToken<Chain>>;
  fee: Amount | null;
  balances: BN[] | null;
  isBalanceLoading: boolean;
  onRefresh?: () => void;
};

const MILLION = 1e6;

const subFee = (payment: Amount, fee: Amount | null) => {
  if (!fee) {
    return payment.amount.toString();
  }

  if (fee.symbol === payment.symbol) {
    const amount = Number(payment.amount) - fee.amount;

    return amount >= 0 ? amount.toString() : '';
  } else {
    return payment.amount.toString();
  }
};

const calcToAmount = (payment: Amount, fee: Amount | null, from: Network, to: Network) => {
  let result: string;

  if (isSubstrateDVM2Ethereum(from, to)) {
    result = payment.amount.toString();
  } else {
    result = subFee(payment, fee);
  }

  return result === '0' ? '' : result;
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
    (val: CrossChainDirection<CrossToken<Chain>, CrossToken<Chain>>) => {
      if (onChange) {
        onChange(val);
      }
    },
    [onChange]
  );

  // eslint-disable-next-line complexity
  const iBalance = useMemo(() => {
    if (!balances) {
      return null;
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
        amount: calcToAmount(
          { amount: +data.from.amount || 0, symbol: data.from.symbol },
          fee,
          data.from.host,
          data.to.host
        ),
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
              amount: calcToAmount({ amount: +from.amount, symbol: data.from.symbol }, fee, from.host, data.to.host),
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
                const { from, to } = data;
                const amount = subFee(
                  { amount: +fromWei({ value: iBalance, decimals: from.decimals }), symbol: from.symbol },
                  fee
                );

                if (amount !== from.amount) {
                  triggerChange({
                    from: { ...from, amount },
                    to: {
                      ...to,
                      amount: calcToAmount({ amount: +amount, symbol: from.symbol }, fee, from.host, to.host),
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
