import { BN } from '@polkadot/util';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { RedeemPayload } from './model';
import { SubstrateSubstrateParachainBridge } from './utils';

export function SubstrateParachain2Substrate({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  fee,
  balances,
  dailyLimit,
}: CrossChainComponentProps<
  SubstrateSubstrateParachainBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<RedeemPayload>();
  const [balance] = (balances ?? []) as BN[];
  const limit = useMemo(() => dailyLimit && new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday)), [dailyLimit]);

  useEffect(() => {
    const fn = () => (payload: RedeemPayload) => {
      const validateObs = payload.bridge.validate(payload, { balance, dailyLimit: limit });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee} /> }))),
        () => payload.bridge.send(payload, new BN(toWei(fee!))),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, dailyLimit, fee, limit, setTxObservableFactory, t]);

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

      <CrossChainInfo bridge={bridge} fee={fee} direction={direction}></CrossChainInfo>
    </>
  );
}
