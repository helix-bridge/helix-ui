import { InfoCircleOutlined } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { message, Tag, Tooltip, Typography } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  PolkadotConnection,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { EthereumDarwiniaBridgeConfig, RedeemPayload } from './model';
import { getRedeemFee, getRedeemTxFee, redeem } from './utils';

const validateBeforeTx = (balances: BN[], amount: BN, fee: BN, symbol: string): string | undefined => {
  const [ring, kton] = balances;
  const ktonSufficient = kton.lt(amount);
  const ringSufficient = ring.lt(amount);
  const validations: [boolean, string][] = [
    [ring.lt(fee), 'Insufficient fee'],
    [isRing(symbol) ? ringSufficient : ktonSufficient, 'Insufficient balance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Darwinia2Ethereum({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  onFeeChange,
  balance: availableBalances,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<EthereumChainConfig>
>) {
  const { t } = useTranslation();

  const { departureConnection, departure } = useApi();

  const [crossChainFee, setCrossChainFee] = useState<BN | null>(null);
  const [txFee, setTxFee] = useState<BN | null>(null);
  const fee = useMemo(() => (crossChainFee ? crossChainFee.add(txFee ?? BN_ZERO) : null), [crossChainFee, txFee]);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const getBalances = useDarwiniaAvailableBalances(departure);
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

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (data: RedeemPayload) => {
      const { api, type } = departureConnection as PolkadotConnection;

      if (type !== 'polkadot' || !api || !fee || !availableBalances) {
        return EMPTY;
      }

      const {
        direction: {
          from: { amount, symbol, decimals },
        },
      } = data;

      const msg = validateBeforeTx(availableBalances as BN[], new BN(toWei({ value: amount, decimals })), fee, symbol);

      if (msg) {
        message.error(t(msg));

        return EMPTY;
      }

      const beforeTransfer = applyModalObs({
        content: <TransferConfirm fee={feeWithSymbol!} value={data} needClaim />,
      });
      const obs = redeem(data, api);
      const afterTransfer = afterCrossChain(TransferDone, { payload: data });

      return createTxWorkflow(beforeTransfer, obs, afterTransfer);
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    availableBalances,
    departureConnection,
    fee,
    feeWithSymbol,
    getBalances,
    setTxObservableFactory,
    t,
  ]);

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
    if (onFeeChange && feeWithSymbol) {
      onFeeChange({ ...feeWithSymbol, amount: +feeWithSymbol.amount });
    }
  }, [feeWithSymbol, onFeeChange]);

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

      <CrossChainInfo bridge={bridge} fee={feeWithSymbol}>
        <div className={`flex justify-between items-center transition-all duration-100`}>
          <Typography.Text>{t('Attention')}</Typography.Text>
          <Tooltip
            title={t('Please perform a claim asset operation in the history section after the transfer is submitted.')}
          >
            <Tag color="cyan" icon={<InfoCircleOutlined />} className="flex items-center mr-0">
              {t('Need Claim')}
            </Tag>
          </Tooltip>
        </div>
      </CrossChainInfo>
    </>
  );
}
