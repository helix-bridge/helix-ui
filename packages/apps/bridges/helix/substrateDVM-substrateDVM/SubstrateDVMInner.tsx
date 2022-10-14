import { BN } from '@polkadot/util';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossToken, DVMChainConfig } from 'shared/model';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useAccount } from '../../../providers';
import { IssuingPayload } from './model';
import { SubstrateDVMInnerBridge } from './utils/bridge-inner';

export function SubstrateDVMInner({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  fee,
  balances,
}: CrossChainComponentProps<SubstrateDVMInnerBridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const { account } = useAccount();
  const [balance] = (balances ?? []) as BN[];

  useEffect(() => {
    const fn = () => (payload: IssuingPayload) => {
      const validateObs = payload.bridge.validate(payload, { balance });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee!} /> }))),
        () => payload.bridge.send(payload),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, fee, setTxObservableFactory]);

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

      <CrossChainInfo bridge={bridge} fee={fee} direction={direction}></CrossChainInfo>
    </>
  );
}
