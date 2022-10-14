import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { CrossToken, DVMChainConfig, PolkadotChainConfig } from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
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
}: CrossChainComponentProps<SubstrateSubstrateDVMBridge, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
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
        direction={direction}
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
        ]}
      ></CrossChainInfo>
    </>
  );
}
