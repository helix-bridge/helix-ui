import { BN } from '@polkadot/util';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, ParachainChainConfig } from 'shared/model';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useApi } from '../../../providers';
import { IssuingPayload } from './model';
import { CrabParachainKaruraBridge } from './utils';

export function CrabParachain2Karura({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  fee,
  balances,
}: CrossChainComponentProps<
  CrabParachainKaruraBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const [balance] = (balances ?? []) as BN[];

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (payload: IssuingPayload) => {
      const validateObs = payload.bridge.validate(payload, { balance });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee} /> }))),
        () => payload.bridge.send(payload),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, departureConnection, fee, setTxObservableFactory, t]);

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

      <CrossChainInfo bridge={bridge} fee={fee}></CrossChainInfo>
    </>
  );
}
