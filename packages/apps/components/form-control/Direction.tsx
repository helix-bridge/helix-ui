import { PauseCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { BridgeStatus, CrossChainDirection, CustomFormControlProps, HashInfo } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { fromWei, isKton, isRing, largeNumber, prettyNumber, updateStorage } from 'shared/utils/helper';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection> & {
  initial: CrossChainDirection;
  fee: number | null;
  balance: BN | BN[] | null;
};

const calcToAmount = (payment: string, paymentFee: number | null) => {
  if (paymentFee === null) {
    return '';
  }

  const amount = Number(payment) - paymentFee;

  return amount >= 0 ? String(amount) : '';
};

export function Direction({ value, initial, onChange, balance, fee = 0 }: DirectionProps) {
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
      fMode: from.meta.mode,
      tMode: to.meta.mode,
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
      to: { ...data.to, amount: data.from.amount !== '' ? calcToAmount(data.from.amount, fee) : '' },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee]);

  return (
    <div className={`relative flex justify-between items-center flex-col`}>
      <Destination
        title={t('From')}
        value={data.from}
        onChange={(from) => {
          triggerChange({ from, to: { ...data.to, amount: calcToAmount(from.amount, fee) } });
        }}
      />

      {iBalance && (
        <Tooltip
          title={
            // eslint-disable-next-line no-magic-numbers
            iBalance.gt(new BN(1_000_000))
              ? fromWei({ value: iBalance, decimals: data.from.decimals }, prettyNumber)
              : ''
          }
          className="absolute right-0 top-28 cursor-pointer space-x-2 text-xs"
        >
          {fromWei(
            { value: iBalance, decimals: data.from.decimals },
            // eslint-disable-next-line no-magic-numbers
            (val: string) => (+val > 1e6 ? largeNumber(val) : val),
            (val: string) => prettyNumber(val, { ignoreZeroDecimal: true, decimal: 3 })
          )}
          <span className="ml-2">{data.from.symbol}</span>
        </Tooltip>
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
