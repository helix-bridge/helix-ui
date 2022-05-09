import { EyeInvisibleFilled } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { FORM_CONTROL } from 'shared/config/constant';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import { AvailableBalance, Bridge, CrossChainComponentProps, CrossChainPayload, SubmitFn } from 'shared/model';
import { applyModalObs, createTxWorkflow, fromWei, isRing, prettyNumber, toWei } from 'shared/utils';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { EthereumDarwiniaBridgeConfig, TxPayload } from './model';
import { getRedeemFee, getRedeemTxFee, issuing } from './utils';

const isSufficient = (balances: AvailableBalance[], amount: BN, fee: BN, symbol: string): boolean => {
  const [ring, kton] = balances;
  const ktonSufficient = new BN(kton.max).gte(amount);
  const ringSufficient = new BN(ring.max).gte(amount);

  return new BN(ring.max).gte(fee) && (isRing(symbol) ? ringSufficient : ktonSufficient);
};

export function Darwinia2Ethereum({ form, setSubmit, direction, bridge, onFeeChange }: CrossChainComponentProps) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts },
    api,
    chain,
    network,
  } = useApi();

  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);
  const [crossChainFee, setCrossChainFee] = useState<BN | null>(null);
  const [txFee, setTxFee] = useState<BN | null>(null);
  const fee = useMemo(() => (crossChainFee ? crossChainFee.add(txFee ?? BN_ZERO) : null), [crossChainFee, txFee]);
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const getBalances = useDarwiniaAvailableBalances(api, network, chain);
  const [recipient, setRecipient] = useState<string>(form.getFieldValue(FORM_CONTROL.recipient));
  const { account } = useAccount();

  const balance = useMemo(() => {
    return availableBalances.find((item) => item.token.symbol.toLowerCase() === direction.from.symbol.toLowerCase());
  }, [availableBalances, direction.from.symbol]);

  useEffect(() => {
    const fn = () => (data: TxPayload) => {
      if (!api || !fee) {
        return EMPTY.subscribe();
      }

      const {
        direction: {
          from: { amount, symbol, decimals },
        },
      } = data;

      const amountWei = new BN(toWei({ value: amount, decimals }));

      if (!isSufficient(availableBalances, amountWei, fee, symbol)) {
        message.error({
          content: t('Insufficient balance'),
        });

        return EMPTY.subscribe();
      }

      const [ring] = availableBalances;

      const beforeTransfer = applyModalObs({
        content: (
          <TransferConfirm
            fee={{ ...ring.token, amount: fromWei({ value: fee, decimals: ring.token.decimals }) }}
            value={data}
          />
        ),
      });
      const obs = issuing(data, api);

      const afterTransfer = afterCrossChain(TransferDone, {
        hashType: 'block',
        onDisappear: () => {
          getBalances(data.sender).then(setAvailableBalances);
        },
        payload: data,
      });

      return createTxWorkflow(beforeTransfer, obs, afterTransfer).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, api, availableBalances, fee, form, getBalances, observer, setSubmit, t]);

  useEffect(() => {
    const balance$$ = from(getBalances(account)).subscribe(setAvailableBalances);

    return () => {
      balance$$.unsubscribe();
    };
  }, [account, accounts, form, getBalances, recipient]);

  useEffect(() => {
    const sub$$ = from(getRedeemFee(bridge as Bridge<EthereumDarwiniaBridgeConfig>)).subscribe(setCrossChainFee);

    return () => {
      sub$$.unsubscribe();
    };
  }, [bridge]);

  useEffect(() => {
    if (!recipient || !account) {
      return;
    }

    const sub$$ = from(
      getRedeemTxFee(bridge as Bridge<EthereumDarwiniaBridgeConfig>, {
        sender: account,
        recipient,
        amount: +direction.from.amount,
      })
    ).subscribe(setTxFee);

    return () => sub$$?.unsubscribe();
  }, [account, bridge, direction.from.amount, recipient]);

  useEffect(() => {
    if (fee && onFeeChange) {
      const amount = fromWei({ value: fee, decimals: direction.from.decimals });

      onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
    }
  }, [direction.from.symbol, direction.from.decimals, fee, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
        onChange={(value) => {
          setRecipient(value);
        }}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={
          fee && {
            amount: fromWei({ value: fee, decimals: direction.from.decimals }),
            symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
          }
        }
      >
        <div className="flex justify-between items-center">
          <Typography.Text>{t('Available balance')}</Typography.Text>

          {balance ? (
            <Typography.Text className="capitalize">
              <span>{fromWei({ value: balance.max, decimals: balance.token.decimals }, prettyNumber)}</span>
              <span className="capitalize ml-1">{balance.token.symbol}</span>
            </Typography.Text>
          ) : (
            <EyeInvisibleFilled />
          )}
        </div>
      </CrossChainInfo>
    </>
  );
}
