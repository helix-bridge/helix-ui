import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { FORM_CONTROL, LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CountLoading } from '../../../components/widget/CountLoading';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useAccount, useApi } from '../../../providers';
import { IssuingPayload } from './model';
import { SubstrateDVMSubstrateDVMBridge } from './utils/bridge';

export function SubstrateDVM2SubstrateDVM({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  fee,
  balances,
}: CrossChainComponentProps<SubstrateDVMSubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const { account } = useAccount();
  const [wRING, native] = (balances ?? []) as BN[];
  const isMounted = useIsMounted();

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (payload: IssuingPayload) => {
      const validateObs = payload.bridge.validate(payload, {
        balance: wRING,
        dailyLimit,
        fee: new BN(toWei(fee!)),
        feeTokenBalance: native,
      });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee} /> }))),
        () => payload.bridge.send(payload, new BN(toWei(fee!))),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, wRING, dailyLimit, departureConnection, fee, setTxObservableFactory, t, native]);

  useEffect(() => {
    const sub$$ = isMetamaskChainConsistent(direction.from.meta)
      .pipe(
        switchMap(() => from(bridge.getDailyLimit(direction))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe({
        next(result) {
          setDailyLimit(result && new BN(result.limit).sub(new BN(result.spentToday)));
        },
        error(error) {
          console.warn('🚀 ~ DailyLimit querying error', error);
        },
      });

    return () => sub$$?.unsubscribe();
  }, [bridge, direction, isMounted]);

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
        fee={fee}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? <span>{fromWei({ value: dailyLimit })}</span> : <CountLoading />,
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
