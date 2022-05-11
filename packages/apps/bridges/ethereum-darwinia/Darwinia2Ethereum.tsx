import { InfoCircleOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { message, Tag, Tooltip } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  AvailableBalance,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  SubmitFn,
} from 'shared/model';
import { fromWei, isRing, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { EthereumDarwiniaBridgeConfig, RedeemPayload } from './model';
import { getRedeemFee, getRedeemTxFee, redeem } from './utils';

const validateBeforeTx = (balances: AvailableBalance[], amount: BN, fee: BN, symbol: string): string | undefined => {
  const [ring, kton] = balances;
  const ktonSufficient = new BN(kton.balance).lt(amount);
  const ringSufficient = new BN(ring.balance).lt(amount);
  const validations: [boolean, string][] = [
    [new BN(ring.balance).lt(fee), 'Insufficient fee'],
    [isRing(symbol) ? ringSufficient : ktonSufficient, 'Insufficient balance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Darwinia2Ethereum({
  form,
  setSubmit,
  direction,
  bridge,
  onFeeChange,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<EthereumChainConfig>
>) {
  const { t } = useTranslation();

  const { api, network } = useApi();

  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);
  const [crossChainFee, setCrossChainFee] = useState<BN | null>(null);
  const [txFee, setTxFee] = useState<BN | null>(null);
  const fee = useMemo(() => (crossChainFee ? crossChainFee.add(txFee ?? BN_ZERO) : null), [crossChainFee, txFee]);
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const getBalances = useDarwiniaAvailableBalances(api, network);
  const [recipient, setRecipient] = useState<string>();
  const { account } = useAccount();

  const feeWithSymbol = useMemo(() => {
    if (fee) {
      const ring = direction.from.meta.tokens.find((item) => isRing(item.symbol))!;

      return {
        amount: fromWei({ value: fee, decimals: ring.decimals }),
        symbol: ring.symbol,
      };
    }

    return null;
  }, [direction, fee]);

  const balance = useMemo(() => {
    return availableBalances.find((item) => item.symbol.toLowerCase() === direction.from.symbol.toLowerCase());
  }, [availableBalances, direction.from.symbol]);

  useEffect(() => {
    const fn = () => (data: RedeemPayload) => {
      if (!api || !fee) {
        return EMPTY.subscribe();
      }

      const {
        direction: {
          from: { amount, symbol, decimals },
        },
      } = data;

      const msg = validateBeforeTx(availableBalances, new BN(toWei({ value: amount, decimals })), fee, symbol);

      if (msg) {
        message.error(t(msg));

        return EMPTY.subscribe();
      }

      const beforeTransfer = applyModalObs({
        content: <TransferConfirm fee={feeWithSymbol!} value={data} />,
      });
      const obs = redeem(data, api);

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
  }, [afterCrossChain, api, availableBalances, fee, feeWithSymbol, form, getBalances, observer, setSubmit, t]);

  useEffect(() => {
    const balance$$ = from(getBalances(account)).subscribe(setAvailableBalances);

    return () => balance$$.unsubscribe();
  }, [account, getBalances]);

  useEffect(() => {
    const sub$$ = from(getRedeemFee(bridge)).subscribe(setCrossChainFee);

    return () => sub$$.unsubscribe();
  }, [bridge]);

  useEffect(() => {
    if (!recipient || !account) {
      return;
    }

    const sub$$ = from(
      getRedeemTxFee(bridge, {
        sender: account,
        recipient,
        amount: +direction.from.amount,
      })
    ).subscribe((result) => setTxFee(result));

    return () => sub$$?.unsubscribe();
  }, [account, bridge, direction.from.amount, recipient]);

  useEffect(() => {
    if (onFeeChange) {
      const amount = fromWei({ value: fee, decimals: direction.from.decimals });

      onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
    }
  }, [direction.from.decimals, direction.from.symbol, fee, onFeeChange]);

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
        fee={feeWithSymbol}
        balance={
          balance && {
            amount: fromWei(balance, prettyNumber),
            symbol: balance.symbol,
          }
        }
        extra={[
          {
            name: t('Attention'),
            content: (
              <Tooltip
                title={t(
                  'Please perform a claim asset operation in the history section after the transfer is submitted.'
                )}
              >
                <Tag color="cyan" icon={<InfoCircleOutlined />} className="flex items-center mr-0">
                  {t('Need claim')}
                </Tag>
              </Tooltip>
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
