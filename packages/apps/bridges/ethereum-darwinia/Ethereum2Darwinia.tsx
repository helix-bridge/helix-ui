import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EMPTY, from } from 'rxjs';
import {
  Bridge,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  SubmitFn,
} from 'shared/model';
import { fromWei, isKton, isRing, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { getErc20Balance } from 'shared/utils/network/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useITranslation } from '../../hooks';
import { useAccount, useApi, useTx } from '../../providers';
import { EthereumDarwiniaBridgeConfig, IssuingPayload } from './model';
import { getIssuingFee, issuing } from './utils';

const validateBeforeTx = (balance: BN, amount: BN, fee: BN, ringBalance: BN, allowance: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [ringBalance.lt(fee), 'Insufficient fee'],
    [balance.lt(amount), 'Insufficient balance'],
    [allowance.lt(amount), 'Insufficient allowance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function Ethereum2Darwinia({
  allowance,
  form,
  setSubmit,
  direction,
  bridge,
  onFeeChange,
  updateAllowancePayload,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<EthereumChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useITranslation();
  const { departureConnection } = useApi();
  const [balance, setBalance] = useState<BN | null>(null);
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

      const { kton, ring } = (bridge.config as EthereumDarwiniaBridgeConfig).contracts;

      if (isKton(value.direction.from.symbol)) {
        getErc20Balance(kton, account, false).then((result) => {
          setBalance(result);
        });
      }

      // always need to refresh ring balance, because of it is a fee token
      getErc20Balance(ring, account, false).then((result) => {
        if (isRing(value.direction.from.symbol)) {
          setBalance(result);
        }

        setRingBalance(result);
      });
    },
    [account, bridge.config]
  );

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (value: IssuingPayload) => {
      if (!fee || !balance || !ringBalance || !allowance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(
        balance,
        new BN(toWei({ value: direction.from.amount })),
        fee,
        ringBalance,
        allowance
      );

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({
          content: <TransferConfirm value={value} fee={feeWithSymbol!} />,
        }),
        issuing(value),
        afterCrossChain(TransferDone, { onDisappear: getBalance, payload: value })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [
    afterCrossChain,
    allowance,
    balance,
    direction.from.amount,
    fee,
    feeWithSymbol,
    getBalance,
    observer,
    ringBalance,
    setSubmit,
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
    if (departureConnection.chainId !== direction.from.meta.ethereumChain.chainId) {
      setBalance(null);
    } else {
      getBalance({ direction });
    }
  }, [direction, getBalance, departureConnection]);

  useEffect(() => {
    if (isRing(direction.from.symbol)) {
      updateAllowancePayload({ spender: bridge.config.contracts.issuing, tokenAddress: bridge.config.contracts.ring });
    }
  }, [bridge.config.contracts.issuing, bridge.config.contracts.ring, direction.from.symbol, updateAllowancePayload]);

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
