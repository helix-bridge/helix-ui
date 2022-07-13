import { Typography } from 'antd';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { from, mergeMap } from 'rxjs';
import {
  Bridge,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useITranslation } from '../../hooks';
import { EthereumDarwiniaBridgeConfig, IssuingPayload } from './model';
import { getIssuingFee, issuing, validate } from './utils';

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
      const validateObs = validate([fee, balances, ring, allowance], {
        balance: isRing(direction.from.symbol) ? ring : kton,
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
        issuing(value),
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
    const token = direction.from.meta.tokens.find((item) => isRing(item.symbol))!;

    updateAllowancePayload({ spender: bridge.config.contracts.issuing, tokenAddress: token.address });
  }, [bridge.config.contracts.issuing, direction.from.meta.tokens, updateAllowancePayload]);

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
        extra={
          isRing(direction.from.symbol)
            ? [
                {
                  name: t('Allowance'),
                  content: (
                    <Typography.Text className="capitalize">
                      <span>
                        {fromWei({ value: allowance }, largeNumber, (num: string) =>
                          prettyNumber(num, { ignoreZeroDecimal: true })
                        )}
                      </span>
                      <span className="capitalize ml-1">{direction.from.symbol}</span>
                    </Typography.Text>
                  ),
                },
              ]
            : undefined
        }
      ></CrossChainInfo>
    </>
  );
}
