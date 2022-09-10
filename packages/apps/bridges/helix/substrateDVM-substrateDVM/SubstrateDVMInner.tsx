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
import { IssuingPayload, SubstrateDVMSubstrateDVMBridgeConfig } from './model';
import { deposit, validate, withdraw } from './utils/tx';

export function SubstrateDVMInner({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  SubstrateDVMSubstrateDVMBridgeConfig,
  CrossToken<DVMChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const { account } = useAccount();
  const [ring] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () => ({
      amount: '0',
      symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
    }),
    [direction.from.meta.tokens]
  );

  const txFn = useMemo(() => {
    const overview = direction.from.cross.find((item) => item.partner.name === direction.from.host);

    return overview?.partner.role === 'issuing' ? deposit : withdraw;
  }, [direction.from.cross, direction.from.host]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const validateObs = validate([ring], {
        balance: ring,
        amount: new BN(toWei(data.direction.from)),
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        txFn(data),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, feeWithSymbol, ring, setTxObservableFactory, txFn]);

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
