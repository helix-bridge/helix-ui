import { EyeInvisibleFilled } from '@ant-design/icons';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { FORM_CONTROL, LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { CrossChainComponentProps, CrossToken, DVMChainConfig, TxObservableFactory } from 'shared/model';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { isRing } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { useAccount, useApi } from '../../../providers';
import { IssuingPayload, SubstrateDVMSubstrateDVMBridgeConfig } from './model';
import { getDailyLimit, getFee } from './utils';
import { issue, redeem, validate } from './utils/tx';

export function SubstrateDVM2SubstrateDVM({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
  updateAllowancePayload,
}: CrossChainComponentProps<
  SubstrateDVMSubstrateDVMBridgeConfig,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const { account } = useAccount();
  const [ring] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => /^[A-Z]?RING|CRAB/.test(item.symbol))!.symbol,
      },
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  const isMounted = useIsMounted();

  const txFn = useMemo(
    () => (bridge.isIssue(direction.from.meta, direction.to.meta) ? issue : redeem),
    [bridge, direction.from.meta, direction.to.meta]
  );

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    updateAllowancePayload({
      spender: bridge.isIssue(direction.from.meta, direction.to.meta)
        ? bridge.config.contracts.backing
        : bridge.config.contracts.issuing,
      tokenAddress: direction.from.address,
    });
  }, [
    bridge,
    bridge.config.contracts.backing,
    direction.from.address,
    direction.from.meta,
    direction.to.meta,
    updateAllowancePayload,
  ]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const validateObs = validate([fee, dailyLimit, ring], {
        balance: ring,
        amount: new BN(toWei(data.direction.from)),
        dailyLimit,
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        txFn(data, fee!),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, ring, dailyLimit, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t, txFn]);

  useEffect(() => {
    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(getDailyLimit(direction))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe((result) => {
        const num = result && new BN(result.limit).sub(new BN(result.spentToday));

        setDailyLimit(num);
      });

    return () => sub$$?.unsubscribe();
  }, [direction, isMounted]);

  useEffect(() => {
    const sub$$ = from(getFee(direction)).subscribe({
      next(result) {
        setFee(result);

        if (onFeeChange) {
          onFeeChange({
            amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.from.decimals }) : 0,
            symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
          });
        }
      },
      error(error) {
        console.warn('🚀 ~ file: SubstrateDVM2SubstrateDVM.tsx ~ line 129 ~ error ~ error', error);
      },
    });

    return () => sub$$.unsubscribe();
  }, [direction, onFeeChange]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  return (
    <>
      <div className="hidden">
        <RecipientItem
          form={form}
          direction={direction}
          bridge={bridge}
          extraTip={t(
            'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
          )}
        />
      </div>

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? <span>{fromWei({ value: dailyLimit })}</span> : <EyeInvisibleFilled />,
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
