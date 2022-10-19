import { PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { ChainBase } from 'shared/core/chain';
import { BridgeStatus, CrossChainDirection, CrossToken, CustomFormControlProps, HashInfo, Network } from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { updateStorage } from 'shared/utils/helper/storage';
import { getBridge, isCBridge, isSubstrateDVMSubstrateDVM } from 'utils/bridge';
import { bridgeFactory } from '../../bridges/bridges';
import { TokenWithAmount } from '../../core/bridge';
import { CountLoading } from '../widget/CountLoading';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>>> & {
  initial: CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>>;
  fee: TokenWithAmount | null;
  balances: BN[] | null;
  isBalanceLoading: boolean;
  onRefresh?: () => void;
};

const MILLION = 1e6;

// eslint-disable-next-line complexity
const subFee = (payment: TokenWithAmount, fee: TokenWithAmount | null, mini?: TokenWithAmount) => {
  if (!fee || fee.symbol !== payment.symbol) {
    return fromWei({ value: payment.amount.sub(mini?.amount ?? BN_ZERO), decimals: payment.decimals });
  }

  const amount = payment.amount.sub(fee.amount).sub(mini?.amount ?? BN_ZERO);

  return amount.gte(BN_ZERO) ? fromWei({ value: amount, decimals: payment.decimals }) : '';
};

const calcToAmount = (payment: TokenWithAmount, fee: TokenWithAmount | null, from: Network, to: Network) => {
  let result: string;

  if (isCBridge(from, to)) {
    result = subFee(payment, fee);
  } else {
    result = fromWei(payment);
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
  fee,
  isBalanceLoading = false,
}: DirectionProps) {
  const data = value ?? initial;
  const { t } = useTranslation();
  const [bridgetStatus, setBridgetStatus] = useState<null | BridgeStatus>(null);

  const triggerChange = useCallback(
    (val: CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>>) => {
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

    if (isSubstrateDVMSubstrateDVM(data.from.host, data.to.host)) {
      const [erc20, native] = balances;

      return data.from.type === 'native' ? native : erc20;
    }

    return balances[0];
  }, [balances, data.from.host, data.from.type, data.to.host]);

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
        amount: calcToAmount({ ...data.from, amount: new BN(toWei(data.from)) }, fee, data.from.host, data.to.host),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee?.amount.toString(), fee?.symbol]);

  return (
    <div className={`relative flex justify-between items-center flex-col`}>
      <Destination
        title={t('From')}
        value={data.from}
        onChange={(from) => {
          const toAmount = calcToAmount({ ...data.from, amount: new BN(toWei(from)) }, fee, from.host, data.to.host);
          triggerChange({
            from,
            to: { ...data.to, amount: toAmount },
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
                const config = getBridge(data);
                const bridge = bridgeFactory(config);
                const mini = bridge.getMinimumFeeTokenHolding && bridge.getMinimumFeeTokenHolding(data);
                const amount = subFee({ ...from, amount: iBalance }, fee, mini ?? undefined);

                if (amount !== from.amount) {
                  const toAmount = calcToAmount(
                    { ...from, amount: new BN(toWei({ ...from, amount })) },
                    fee,
                    from.host,
                    to.host
                  );

                  triggerChange({
                    from: { ...from, amount },
                    to: { ...to, amount: toAmount },
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
