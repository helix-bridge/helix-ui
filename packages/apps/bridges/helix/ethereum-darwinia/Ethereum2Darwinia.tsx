import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import {
  Bridge,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, toWei, largeNumber, prettyNumber } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useITranslation } from '../../../hooks';
import { EthereumDarwiniaBridgeConfig, IssuingPayload } from './model';
import { getIssuingFee, issue, validate } from './utils';

export function Ethereum2Darwinia({
  allowance,
  form,
  setTxObservableFactory,
  direction,
  bridge,
  onFeeChange,
  updateAllowancePayload,
  balances,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<EthereumChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useITranslation();
  const [fee, setFee] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction, fee]
  );

  const [ring, kton] = (balances ?? []) as BN[];

  useEffect(() => {
    const fn = () => (value: IssuingPayload) => {
      const isRING = isRing(direction.from.symbol);
      const validateObs = validate([fee, balances, ring, allowance], {
        isRING,
        balance: isRING ? ring : kton,
        amount: new BN(toWei({ value: direction.from.amount })),
        fee,
        ringBalance: ring,
        allowance,
      });

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() =>
            applyModalObs({
              content: <TransferConfirm value={value} fee={feeWithSymbol!} />,
            })
          )
        ),
        issue(value),
        afterCrossChain(TransferDone, { payload: value })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    allowance,
    balances,
    direction.from.amount,
    direction.from.symbol,
    fee,
    feeWithSymbol,
    kton,
    ring,
    setTxObservableFactory,
    t,
  ]);

  useEffect(() => {
    const sub$$ = from(getIssuingFee(bridge as Bridge<EthereumDarwiniaBridgeConfig>)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        onFeeChange({
          amount: +fromWei({ value: result }),
          symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
        });
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.meta.tokens, direction.from.symbol, onFeeChange]);

  useEffect(() => {
    const ringConfig = direction.from.meta.tokens.find((item) => isRing(item.name))!;

    updateAllowancePayload({ spender: bridge.config.contracts.backing, tokenAddress: ringConfig.address });
  }, [bridge.config.contracts.backing, direction.from.address, direction.from.meta.tokens, updateAllowancePayload]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={
          <span className="inline-block mt-2">
            {t(
              'Please be sure to fill in the real Darwinia mainnet account, and keep the account recovery files such as mnemonic properly.'
            )}
          </span>
        }
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
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
