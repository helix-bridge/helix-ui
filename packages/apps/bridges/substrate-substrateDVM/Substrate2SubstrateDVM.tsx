import { EyeInvisibleFilled } from '@ant-design/icons';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from, of, switchMap } from 'rxjs';
import { LONG_DURATION } from 'shared/config/constant';
import { useDarwiniaAvailableBalances, useIsMounted } from 'shared/hooks';
import {
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  PolkadotConnection,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, pollWhile, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useApi } from '../../providers';
import { useBridgeStatus } from './hooks';
import { IssuingPayload, SubstrateSubstrateDVMBridgeConfig } from './model';
import { getDailyLimit, getIssuingFee } from './utils';
import { issuing } from './utils/tx';

const validateBeforeTx = (balance: BN, amount: BN, limit: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.lt(amount), 'Insufficient balance'],
    [limit.lt(amount), 'Insufficient daily limit'],
  ];

  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Substrate2SubstrateDVM({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balance: availableBalances,
}: CrossChainComponentProps<
  SubstrateSubstrateDVMBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection, departure } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const getBalances = useDarwiniaAvailableBalances(departure);
  const bridgeState = useBridgeStatus(direction);
  const [availableBalance] = availableBalances as BN[];

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  const isMounted = useIsMounted();

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (data: IssuingPayload) => {
      const { api } = departureConnection as PolkadotConnection;

      if (departureConnection.type !== 'polkadot' || !api || !fee || !dailyLimit || !availableBalance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(availableBalance, new BN(toWei(data.direction.from)), dailyLimit);

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }),
        issuing(data, fee),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    availableBalance,
    dailyLimit,
    departureConnection,
    fee,
    feeWithSymbol,
    getBalances,
    setTxObservableFactory,
    t,
  ]);

  useEffect(() => {
    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(getDailyLimit(direction.to.address, direction))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe((result) => {
        const num = result && new BN(result.limit).sub(new BN(result.spentToday));

        setDailyLimit(num);
      });

    return () => sub$$?.unsubscribe();
  }, [direction, isMounted]);

  useEffect(() => {
    const sub$$ = from(getIssuingFee(bridge)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.from.decimals }) : 0,
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.decimals, direction.from.meta.tokens, direction.from.symbol, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <Typography.Text>{fromWei({ value: dailyLimit, decimals: 9 })}</Typography.Text>
            ) : (
              <EyeInvisibleFilled />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
