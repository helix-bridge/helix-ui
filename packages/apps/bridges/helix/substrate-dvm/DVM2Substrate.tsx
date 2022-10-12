import { BN } from '@polkadot/util';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { RedeemPayload } from './model';
import { SubstrateDVMBridge } from './utils';

export function DVM2Substrate({
  form,
  direction,
  bridge,
  onFeeChange,
  balances,
  setTxObservableFactory,
}: CrossChainComponentProps<SubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<RedeemPayload>();
  const [balance] = (balances ?? []) as BN[];

  useEffect(() => {
    const fn = () => (data: RedeemPayload) => {
      const validateObs = data.bridge.validate([balance], {
        balance,
        amount: new BN(toWei(data.direction.from)),
      });

      return createTxWorkflow(
        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }))),
        data.bridge.burn(data),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, setTxObservableFactory, t]);

  useEffect(() => {
    if (onFeeChange) {
      onFeeChange({
        amount: 0,
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      });
    }
  }, [direction.from.meta.tokens, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
          { type: 'Substrate' }
        )}
      />

      <CrossChainInfo bridge={bridge} fee={null} hideFee></CrossChainInfo>
    </>
  );
}
