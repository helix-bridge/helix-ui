import { BN } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, ParachainChainConfig } from 'shared/model';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
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
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  CrabParachainKaruraBridge,
  CrossToken<ParachainChainConfig>,
  CrossToken<ParachainChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const [balance] = (balances ?? []) as BN[];
  const symbol = direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol;

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol,
      },
    [direction.from.decimals, fee, symbol]
  );

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const validateObs = data.bridge.validate([balance], {
        balance,
        amount: new BN(toWei(data.direction.from)),
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        data.bridge.back(data),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = from(bridge.getFee(direction)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: +fromWei({ value: result, decimals: direction.from.decimals }),
          symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, onFeeChange, symbol]);

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

      <CrossChainInfo bridge={bridge} fee={feeWithSymbol}></CrossChainInfo>
    </>
  );
}
