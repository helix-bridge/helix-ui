import { EyeInvisibleFilled } from '@ant-design/icons';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useMemo } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { Bridge, CrossChainComponentProps, CrossChainPayload, SubmitFn } from 'shared/model';
import {
  applyModalObs,
  createTxWorkflow,
  fromWei,
  getErc20TokenBalance,
  isKton,
  isRing,
  prettyNumber,
  toWei,
} from 'shared/utils';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount } from '../../providers';
import { Allowance } from './Allowance';
import { EthereumDarwiniaBridgeConfig, TxPayload } from './model';
import { getIssuingAllowance, getIssuingFee, redeem } from './utils';

export function Ethereum2Darwinia({ form, setSubmit, direction, bridge, onFeeChange }: CrossChainComponentProps) {
  const { t } = useTranslation();
  const [allowance, setAllowance] = useState<BN | null>(null);
  const [max, setMax] = useState<BN | null>(null);
  const [fee, setFee] = useState<BN | null>(null);
  const [ringBalance, setRingBalance] = useState<BN | null>(null);
  const { account } = useAccount();
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction, fee]
  );

  const getBalance = useCallback(
    (value: Pick<CrossChainPayload, 'direction'>) => {
      if (!account) {
        return;
      }

      const { kton, ring, issuing } = (bridge.config as EthereumDarwiniaBridgeConfig).contracts;

      if (isKton(value.direction.from.symbol)) {
        getErc20TokenBalance(kton, account, false).then((balance) => {
          setMax(balance);
        });
      }

      // always need to refresh ring balance, because of it is a fee token
      getErc20TokenBalance(ring, account, false).then((balance) => {
        if (isRing(value.direction.from.symbol)) {
          setMax(balance);
        }

        setRingBalance(balance);
      });

      getIssuingAllowance(account, ring, issuing).then((num) => setAllowance(num));
    },
    [account, bridge.config]
  );

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (value: CrossChainPayload) => {
      if (!fee || !max || !ringBalance) {
        return EMPTY.subscribe();
      }

      if (ringBalance.lt(fee)) {
        message.error({ content: t('Insufficient fee') });

        return EMPTY.subscribe();
      }

      if (max.lt(new BN(toWei({ value: direction.from.amount })))) {
        message.error({ content: t('Insufficient balance') });
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({
          content: <TransferConfirm value={value} fee={feeWithSymbol!} />,
        }),
        redeem(value as TxPayload),
        afterCrossChain(TransferDone, { onDisappear: getBalance, payload: value })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, direction, fee, max, observer, getBalance, ringBalance, setSubmit, t, feeWithSymbol]);

  useEffect(() => {
    const sub$$ = from(getIssuingFee(bridge as Bridge<EthereumDarwiniaBridgeConfig>)).subscribe((result) => {
      setFee(result);

      if (fee && onFeeChange) {
        const amount = fromWei({ value: fee });

        onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.symbol, fee, onFeeChange]);

  useEffect(() => {
    getBalance({ direction });
  }, [direction, getBalance]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={
          <span className="inline-block mt-2">
            <Trans>
              Please be sure to fill in the real Darwinia mainnet account, and keep the account recovery files such as
              mnemonic properly.
            </Trans>
          </span>
        }
      />

      <CrossChainInfo bridge={bridge} fee={feeWithSymbol}>
        <div className="flex justify-between items-center">
          <Typography.Text>{t('Available balance')}</Typography.Text>

          {max ? (
            <Typography.Text className="capitalize">
              <span>{fromWei({ value: max }, prettyNumber)}</span>
              <span className="capitalize ml-1">{direction.from.symbol}</span>
            </Typography.Text>
          ) : (
            <EyeInvisibleFilled />
          )}
        </div>

        <div className="flex justify-between items-center">
          <Typography.Text>{t('Allowance')}</Typography.Text>

          <Allowance direction={direction} bridge={bridge} allowance={allowance} afterAllow={setAllowance} />
        </div>
      </CrossChainInfo>
    </>
  );
}
