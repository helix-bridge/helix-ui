import { BN_ZERO } from '@polkadot/util';
import { Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import BN from 'bn.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { FORM_CONTROL } from 'shared/config/constant';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  AvailableBalance,
  Bridge,
  ConnectionStatus,
  CrossChainComponentProps,
  CrossChainPayload,
  SubmitFn,
} from 'shared/model';
import { applyModalObs, createTxWorkflow, fromWei, isRing, prettyNumber } from 'shared/utils';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferSuccess } from '../../components/tx/TransferSuccess';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { EthereumDarwiniaBridgeConfig, TxPayload } from './model';
import { getRedeemFee, getRedeemTxFee, issuing } from './utils';

/**
 * @description test chain: pangolin -> ropsten
 */
export function Darwinia2Ethereum({ form, setSubmit, direction, bridge, onFeeChange }: CrossChainComponentProps) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts, status },
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

  useEffect(() => {
    const fn = () => (data: TxPayload) => {
      if (!api || !fee) {
        return EMPTY.subscribe();
      }

      const beforeTransfer = applyModalObs({ content: <TransferConfirm value={data} /> });
      const obs = issuing(data, api);

      const afterTransfer = afterCrossChain(TransferSuccess, {
        hashType: 'block',
        onDisappear: () => {
          form.setFieldsValue({
            [FORM_CONTROL.sender]: data.sender,
          });
          getBalances(data.sender).then(setAvailableBalances);
        },
      })(data);

      return createTxWorkflow(beforeTransfer, obs, afterTransfer).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, api, fee, form, getBalances, observer, setSubmit]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    form.setFieldsValue({
      [FORM_CONTROL.sender]: account,
    });

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
      {status === ConnectionStatus.success && (
        <>
          <FormItem label={t('Balance')}>
            <div>
              {availableBalances
                .filter((item) => item.token.symbol.toLowerCase() === direction.from.symbol.toLowerCase())
                .map(({ max, token }) => (
                  <Input
                    disabled
                    key={token.symbol}
                    placeholder={t('Available balance: {{value}} {{symbol}}', {
                      value: fromWei({ value: max, decimals: token.decimals }, prettyNumber),
                      symbol: token.symbol,
                    })}
                  />
                ))}
            </div>
          </FormItem>

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
        </>
      )}

      <CrossChainInfo
        bridge={bridge}
        fee={
          fee && {
            amount: fromWei({ value: fee, decimals: direction.from.decimals }),
            symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
          }
        }
      />
    </>
  );
}
