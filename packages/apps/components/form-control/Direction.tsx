import { PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Tooltip } from 'antd';
import BN from 'bn.js';
import { has } from 'lodash';
import isObject from 'lodash/isObject';
import pick from 'lodash/pick';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'shared/components/widget/Icon';
import { DEFAULT_DIRECTION } from 'shared/config/constant';
import { ChainBase } from 'shared/core/chain';
import {
  BridgeStatus,
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossChainPureDirection,
  CrossToken,
  CustomFormControlProps,
  HashInfo,
  TokenWithBridgesInfo,
} from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { readStorage, updateStorage } from 'shared/utils/helper/storage';
import { isCBridge, isXCM, isLpBridge } from 'utils/bridge';
import { Bridge, TokenWithAmount } from '../../core/bridge';
import { getOriginChainConfig } from '../../utils/network';
import { chainFactory } from '../../utils/network/chain';
import { CountLoading } from '../widget/CountLoading';
import { Destination } from './Destination';

type DirectionProps = CustomFormControlProps<CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>>> & {
  // initial: CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>>;
  fee: TokenWithAmount | null;
  balances: BN[] | null;
  bridge: Bridge<BridgeConfig, ChainConfig, ChainConfig> | null;
  isBalanceLoading: boolean;
  onRefresh?: () => void;
};

const MILLION = 1e6;

export function toDirection({
  host,
  symbol,
}: Pick<TokenWithBridgesInfo, 'host' | 'symbol'>): CrossToken<ChainBase> | null {
  const config = getOriginChainConfig(host);
  const token = config.tokens.find((item) => item.symbol === symbol && !item.deprecated);

  return token ? { ...token, amount: '', meta: chainFactory(config) } : null;
}

// eslint-disable-next-line complexity
export const calcMax = (payment: TokenWithAmount, fee: TokenWithAmount | null, mini?: TokenWithAmount) => {
  if (!fee || fee.symbol !== payment.symbol) {
    return fromWei({ value: payment.amount.sub(mini?.amount ?? BN_ZERO), decimals: payment.decimals });
  }

  const amount = payment.amount.sub(fee.amount).sub(mini?.amount ?? BN_ZERO);

  return amount.gte(BN_ZERO) ? fromWei({ value: amount, decimals: payment.decimals }) : '';
};

const calcToAmount = (payment: TokenWithAmount, fee: TokenWithAmount | null, direction: CrossChainPureDirection) => {
  let result: string;

  if (isCBridge(direction) || isXCM(direction)) {
    result = calcMax(payment, fee);
  } else {
    result = fromWei(payment);
  }

  return result === '0' ? '' : result;
};

// eslint-disable-next-line complexity
export function Direction({
  value,
  bridge,
  onChange,
  balances,
  onRefresh,
  fee,
  isBalanceLoading = false,
}: DirectionProps) {
  const data = useMemo(
    () => value ?? { from: toDirection(DEFAULT_DIRECTION.from)!, to: toDirection(DEFAULT_DIRECTION.to)! },
    [value]
  );

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

  const iBalance = useMemo(() => balances && balances[0], [balances]);

  useEffect(() => {
    if (!value) {
      return;
    }

    const { from, to } = value;
    const info = {
      from: pick(from, ['symbol', 'host']),
      to: pick(to, ['symbol', 'host']),
    } as HashInfo;

    if (bridge) {
      setBridgetStatus(bridge.status);
    } else {
      setBridgetStatus(null);
    }

    updateStorage(info);
  }, [bridge, value]);

  useEffect(() => {
    triggerChange({
      from: data.from,
      to: {
        ...data.to,
        amount: calcToAmount({ ...data.from, amount: new BN(toWei(data.from)) }, fee, data),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee?.amount.toString(), fee?.symbol]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    const { from: storedForm, to: storedTo } = readStorage();

    if (
      storedForm &&
      storedTo &&
      [storedForm, storedTo].every((item) => isObject(item) && has(item, 'host') && has(item, 'symbol'))
    ) {
      const fromDir = toDirection(storedForm);
      const toDir = toDirection(storedTo);
      if (fromDir && toDir) {
        triggerChange({
          from: toDirection(storedForm)!,
          to: toDirection(storedTo)!,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative flex justify-between items-center flex-col`}>
      <Destination
        title={t('From')}
        value={data.from}
        onChange={(from) => {
          const toAmount = calcToAmount({ ...data.from, amount: new BN(toWei(from)) }, fee, { from, to: data.to });
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
              // eslint-disable-next-line complexity
              onClick={async () => {
                if (!bridge) {
                  return;
                }
                const { from, to } = data;
                const mini = bridge.getMinimumFeeTokenHolding && bridge.getMinimumFeeTokenHolding(data);
                let dynamicFee = fee;
                if (isLpBridge(data)) {
                  dynamicFee = await bridge.getFee({
                    from: {
                      ...from,
                      amount: fromWei({ value: iBalance, decimals: data.from.decimals }),
                    },
                    to: { ...to },
                  });
                }
                const amount = calcMax(
                  { ...from, amount: iBalance },
                  isCBridge(data) || isXCM(data) ? null : dynamicFee,
                  mini ?? undefined
                );

                if (amount !== from.amount) {
                  const toAmount = calcToAmount(
                    { ...from, amount: new BN(toWei({ ...from, amount })) },
                    dynamicFee,
                    data
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
