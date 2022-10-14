import { BN } from '@polkadot/util';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useAccount } from '../../../providers';
import { IssuingPayload, RedeemPayload } from './model';
import { SubstrateDVMEthereumBridge } from './utils/bridge';

export function SubstrateDVM2Ethereum({
  form,
  setTxObservableFactory,
  fee,
  direction,
  bridge,
  balances,
  dailyLimit,
}: CrossChainComponentProps<SubstrateDVMEthereumBridge, CrossToken<EthereumChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<IssuingPayload | RedeemPayload>();
  const { account } = useAccount();
  const [balance, nativeBalance] = (balances ?? []) as BN[];
  const limit = useMemo(() => dailyLimit && new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday)), [dailyLimit]);

  useEffect(() => {
    const fn = () => (payload: IssuingPayload | RedeemPayload) => {
      const validateObs = payload.bridge.validate(payload, {
        balance,
        dailyLimit: limit,
        fee: new BN(toWei(fee!)),
        feeTokenBalance: nativeBalance,
      });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee} /> }))),
        () => payload.bridge.send(payload, new BN(toWei(fee!))),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, dailyLimit, fee, nativeBalance, balance, setTxObservableFactory, limit]);

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
