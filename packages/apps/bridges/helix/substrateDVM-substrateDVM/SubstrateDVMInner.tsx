import BN from 'bn.js';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossChainComponentProps, CrossToken, DVMChainConfig, TxObservableFactory } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { useAccount } from '../../../providers';
import { SubstrateDVMSubstrateDVMBridgeInner } from './bridge-inner';
import { IssuingPayload } from './model';
import { validate } from './utils/tx';

export function SubstrateDVMInner({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  SubstrateDVMSubstrateDVMBridgeInner,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const { account } = useAccount();
  const [ring, native] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () => ({
      amount: '0',
      symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
    }),
    [direction.from.meta.tokens]
  );

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const balance = data.direction.from.type === 'native' ? native : ring;
      const validateObs = validate([balance], {
        balance,
        amount: new BN(toWei(data.direction.from)),
      });
      const overview = data.direction.from.cross.find((item) => item.partner.name === data.direction.from.host);
      const txFn = overview?.partner.role === 'issuing' ? data.bridge.back : data.bridge.burn;

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        txFn(data),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, feeWithSymbol, native, ring, setTxObservableFactory]);

  useEffect(() => {
    if (onFeeChange) {
      onFeeChange({
        amount: 0,
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      });
    }
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

      <CrossChainInfo bridge={bridge} fee={feeWithSymbol}></CrossChainInfo>
    </>
  );
}
