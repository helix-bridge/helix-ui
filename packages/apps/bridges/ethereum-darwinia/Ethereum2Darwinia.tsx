import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
import { fromWei, isKton, isRing, prettyNumber, toWei } from 'shared/utils/helper';
import { getErc20TokenBalance } from 'shared/utils/mappingToken';
import { applyModalObs, createTxWorkflow, getAllowance } from 'shared/utils/tx';
import { Allowance } from '../../components/bridge/Allowance';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount } from '../../providers';
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
  form,
  setSubmit,
  direction,
  bridge,
  onFeeChange,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<EthereumChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useTranslation();
  const [allowance, setAllowance] = useState<BN | null>(null);
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

      const { kton, ring, issuing: issuingAddress } = (bridge.config as EthereumDarwiniaBridgeConfig).contracts;

      if (isKton(value.direction.from.symbol)) {
        getErc20TokenBalance(kton, account, false).then((result) => {
          setBalance(result);
        });
      }

      // always need to refresh ring balance, because of it is a fee token
      getErc20TokenBalance(ring, account, false).then((result) => {
        if (isRing(value.direction.from.symbol)) {
          setBalance(result);
        }

        setRingBalance(result);
      });

      getAllowance(account, ring, issuingAddress, direction.from.meta.provider).then((num) => setAllowance(num));
    },
    [account, bridge.config, direction.from.meta.provider]
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
        const amount = fromWei({ value: result });

        onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.symbol, onFeeChange]);

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

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        balance={
          balance && {
            amount: fromWei({ value: balance }, prettyNumber),
            symbol: direction.from.symbol,
          }
        }
        extra={[
          {
            name: t('Allowance'),
            content: (
              <Allowance
                direction={direction}
                spender={bridge.config.contracts.ring}
                tokenAddress={bridge.config.contracts.issuing}
                onChange={setAllowance}
              />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
