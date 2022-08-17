import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from, mergeMap } from 'rxjs';
import {
  CrabParachainKaruraParachainBridgeConfig,
  CrossChainComponentProps,
  CrossToken,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../hooks';
import { useApi } from '../../providers';
import { IssuingPayload } from './model';
import { getFee } from './utils';
import { issuing, validate } from './utils/tx';

export function CrabParachain2KaruraParachain({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  CrabParachainKaruraParachainBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<PolkadotChainConfig>
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
      const validateObs = validate([balance], {
        balance,
        amount: new BN(toWei(data.direction.from)),
      });
      const pallet = 5;

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        issuing(data, pallet),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = from(getFee(direction)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: +fromWei({ value: result, decimals: direction.from.decimals }),
          symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [direction, onFeeChange, symbol]);

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
