import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks/isMounted';
import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { fromWei, prettyNumber, toWei } from 'shared/utils/helper/balance';
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
import { useApi } from '../../../providers';
import { RedeemPayload } from './model';
import { SubstrateSubstrateParachainBridge } from './utils';

export function SubstrateParachain2Substrate({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  fee,
  balances,
}: CrossChainComponentProps<
  SubstrateSubstrateParachainBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<RedeemPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const [balance] = (balances ?? []) as BN[];
  const isMounted = useIsMounted();

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (payload: RedeemPayload) => {
      const validateObs = payload.bridge.validate(payload, { balance, dailyLimit });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee} /> }))),
        () => payload.bridge.send(payload, new BN(toWei(fee!))),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, dailyLimit, departureConnection, fee, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = from(bridge.getDailyLimit(direction))
      .pipe(pollWhile(LONG_DURATION, () => isMounted))
      .subscribe({
        next(res) {
          setDailyLimit(res && new BN(res.limit));
        },
        error(error) {
          console.warn('🚀 ~ DailyLimit querying error', error);
        },
      });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, isMounted]);

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
        fee={fee}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <span>
                {fromWei({ value: dailyLimit, decimals: direction.to.decimals }, (value) =>
                  prettyNumber(value, { ignoreZeroDecimal: true })
                )}
              </span>
            ) : (
              <CountLoading />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
