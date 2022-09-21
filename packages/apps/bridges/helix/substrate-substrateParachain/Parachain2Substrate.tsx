import BN from 'bn.js';
import upperFirst from 'lodash/upperFirst';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import {
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
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
import { useApi } from '../../../providers';
import { IssuingPayload, SubstrateSubstrateParachainBridgeConfig } from './model';
import { getRedeemFee } from './utils';
import { redeem, validate } from './utils/tx';

export function Parachain2Substrate({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  SubstrateSubstrateParachainBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
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
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload) => {
      const validateObs = validate([fee, dailyLimit, ring], {
        balance: ring,
        amount: new BN(toWei({ value: data.direction.from.amount, decimals: 9 })),
        dailyLimit,
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }))
        ),
        redeem(data, fee!),
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
          const section = `to${direction.from.meta.name.split('-').map(upperFirst).join('')}Backing`;

          return from(api.query[section].secureLimitedRingAmount());
        })
      )
      .subscribe((result) => {
        const data = result.toJSON() as [number, number];
        const num = result && new BN(data[1]);

        setDailyLimit(num);
      });

    return () => sub$$.unsubscribe();
  }, [direction]);

  useEffect(() => {
    const sub$$ = from(getRedeemFee(bridge)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: isRing(direction.from.symbol) ? +fromWei({ value: result, decimals: direction.from.decimals }) : 0,
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.decimals, direction.from.meta.tokens, direction.from.symbol, onFeeChange]);

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
                {fromWei({ value: dailyLimit, decimals: 9 }, (value) =>
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
