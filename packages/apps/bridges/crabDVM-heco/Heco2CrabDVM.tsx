import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { EMPTY, from } from 'rxjs';
import {
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  DVMChainConfig,
  EthereumChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount } from '../../providers';
import { CrabDVMHecoBridgeConfig, RedeemPayload } from './model';
import { getRedeemFee, issuing } from './utils';

const validateBeforeTx = (balance: BN, amount: BN, allowance: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.lt(amount), 'Insufficient balance'],
    [allowance.lt(amount), 'Insufficient allowance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Heco2CrabDVM({
  allowance,
  form,
  bridge,
  direction,
  balances,
  onFeeChange,
  setTxObservableFactory,
}: // updateAllowancePayload,
CrossChainComponentProps<CrabDVMHecoBridgeConfig, CrossToken<DVMChainConfig>, CrossToken<EthereumChainConfig>>) {
  const { t } = useTranslation();
  const [fee, setFee] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { account } = useAccount();

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  useEffect(() => {
    const fn = () => (data: RedeemPayload) => {
      if (!fee || !balances || !allowance) {
        return EMPTY;
      }

      const msg = validateBeforeTx(balances[0] as BN, new BN(toWei(direction.from)), allowance);

      if (msg) {
        message.error(t(msg));
        return EMPTY;
      }

      const beforeTx = applyModalObs({
        content: <TransferConfirm value={data} fee={feeWithSymbol!}></TransferConfirm>,
      });

      const txObs = issuing();

      return createTxWorkflow(beforeTx, txObs, afterCrossChain(TransferDone, { payload: data }));
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [account, afterCrossChain, allowance, balances, direction.from, fee, feeWithSymbol, setTxObservableFactory, t]);

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
        bridge={bridge}
        direction={direction}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
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
        ]}
      ></CrossChainInfo>
    </>
  );
}
