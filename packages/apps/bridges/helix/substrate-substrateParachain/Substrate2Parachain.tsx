import { hexToU8a, BN } from '@polkadot/util';
import upperFirst from 'lodash/upperFirst';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, ParachainChainConfig, PolkadotChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { fromWei, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
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
import { IssuingPayload } from './model';
import { SubstrateSubstrateParachainBridge } from './utils';

export function Substrate2Parachain({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  SubstrateSubstrateParachainBridge,
  CrossToken<PolkadotChainConfig>,
  CrossToken<ParachainChainConfig>
>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload>();
  const bridgeState = useCheckSpecVersion(direction);
  const [ring] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction.from.meta.tokens, direction.from.decimals, fee]
  );

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const validateObs = data.bridge.validate([fee, dailyLimit, ring], {
        balance: ring,
        amount: new BN(toWei(data.direction.from)),
        dailyLimit,
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        () => data.bridge.back(data, fee!),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, ring, dailyLimit, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t]);

  useEffect(() => {
    const api = entrance.polkadot.getInstance(direction.to.meta.provider);

    const sub$$ = from(waitUntilConnected(api))
      .pipe(
        mergeMap(() => {
          const section = `from${upperFirst(direction.from.meta.name)}Issuing`;

          return from(api.query[section].secureLimitedRingAmount());
        })
      )
      .subscribe((result) => {
        const data = result.toJSON() as [number, string]; // [0, hexString]
        const num = hexToU8a(data[1]);

        setDailyLimit(new BN(num));
      });

    return () => sub$$.unsubscribe();
  }, [direction]);

  useEffect(() => {
    const sub$$ = from(bridge.getFee(direction)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.from.decimals }) : 0,
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, onFeeChange]);

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
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <span>
                {fromWei({ value: dailyLimit, decimals: 18 }, (value) =>
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
