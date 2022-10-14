import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CountLoading } from '../../../components/widget/CountLoading';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { CrossChainPayload, TxObservableFactory } from '../../../model/tx';
import { RedeemPayload } from './model';
import { SubstrateSubstrateDVMBridge } from './utils/bridge';

export function SubstrateDVM2Substrate({
  allowance,
  form,
  bridge,
  direction,
  balances,
  fee,
  setTxObservableFactory,
  setBridgeState,
}: CrossChainComponentProps<SubstrateSubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
  const bridgeState = useCheckSpecVersion(direction);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const [balance = BN_ZERO] = (balances ?? []) as BN[];

  useEffect(() => {
    const fn = () => (payload: RedeemPayload) => {
      const validateObs = payload.bridge.validate(payload, { balance, allowance, fee: fee && new BN(toWei(fee)) });

      const beforeTx = validateObs.pipe(
        mergeMap(() =>
          applyModalObs({
            content: <TransferConfirm value={payload} fee={fee!}></TransferConfirm>,
          })
        )
      );

      return createTxWorkflow(beforeTx, payload.bridge.burn(payload), afterCrossChain(TransferDone, { payload }));
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, allowance, balance, fee, setTxObservableFactory]);

  useEffect(() => {
    const { to: arrival } = direction;
    const api = entrance.polkadot.getInstance(arrival.meta.provider);
    const sub$$ = from(waitUntilConnected(api))
      .pipe(
        mergeMap(() => {
          const section = arrival.meta.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
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
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  return (
    <>
      <RecipientItem
        form={form}
        bridge={bridge}
        direction={direction}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={fee}
        extra={[
          {
            name: t('Allowance'),
            content: (
              <span className="capitalize">
                <span>
                  {fromWei({ value: allowance }, largeNumber, (num: string) =>
                    prettyNumber(num, { ignoreZeroDecimal: true })
                  )}
                </span>
                <span className="capitalize ml-1">{direction.from.symbol}</span>
              </span>
            ),
          },
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <span>
                {dailyLimit.isZero()
                  ? t('Infinite')
                  : fromWei({ value: dailyLimit, decimals: 9 }, (val: string) =>
                      prettyNumber(val, { ignoreZeroDecimal: true })
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
