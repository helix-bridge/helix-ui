import { BN } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { isRing } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CountLoading } from '../../../components/widget/CountLoading';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useApi } from '../../../providers';
import { IssuingPayload } from './model';
import { SubstrateSubstrateDVMBridge } from './utils';

export function Substrate2SubstrateDVM({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
}: CrossChainComponentProps<SubstrateSubstrateDVMBridge, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const [ring] = (balances ?? []) as BN[];

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
    const fn = () => (data: IssuingPayload) => {
      const validateObs = data.bridge.validate([fee, dailyLimit, ring], {
        balance: ring,
        amount: new BN(toWei(data.direction.from)),
        dailyLimit,
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        () => data.bridge.back(data, fee!),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, ring, dailyLimit, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(bridge.getDailyLimit(direction))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe((result) => {
        const num = result && new BN(result.limit).sub(new BN(result.spentToday));

        setDailyLimit(num);
      });

    return () => sub$$?.unsubscribe();
  }, [bridge, direction, isMounted]);

  useEffect(() => {
    const sub$$ = from(bridge.getFee(direction)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.from.decimals }) : 0,
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? <span>{fromWei({ value: dailyLimit, decimals: 9 })}</span> : <CountLoading />,
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
