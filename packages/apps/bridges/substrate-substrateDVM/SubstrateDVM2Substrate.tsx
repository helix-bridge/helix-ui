import { EyeInvisibleFilled } from '@ant-design/icons';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { EMPTY, from, mergeMap, switchMap } from 'rxjs';
import { RegisterStatus } from 'shared/config/constant';
import {
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  SubmitFn,
} from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { fromWei, isRing, prettyNumber, toWei } from 'shared/utils/helper';
import { getS2SMappingAddress } from 'shared/utils/mappingToken';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { Allowance } from '../../components/bridge/Allowance';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useMappingTokens } from '../../hooks';
import { useTx } from '../../providers';
import { useBridgeStatus } from './hooks';
import { RedeemPayload, SubstrateSubstrateDVMBridgeConfig } from './model';
import { getRedeemFee } from './utils';
import { redeem } from './utils/tx';

const validateBeforeTx = (balance: BN, amount: BN, fee: BN, allowance: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.lt(fee), 'Insufficient fee'],
    [balance.lt(amount), 'Insufficient balance'],
    [allowance.lt(amount), 'Insufficient allowance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

export function SubstrateDVM2Substrate({
  form,
  bridge,
  direction,
  onFeeChange,
  setSubmit,
  setBridgeState,
}: CrossChainComponentProps<
  SubstrateSubstrateDVMBridgeConfig,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useTranslation();
  const { tokens, refreshTokenBalance } = useMappingTokens(direction, RegisterStatus.registered);
  const bridgeState = useBridgeStatus(direction);
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const [allowance, setAllowance] = useState<BN | null>(null);
  const [spender, setSpender] = useState<string>('');
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { observer } = useTx();

  const balance = useMemo(
    () =>
      tokens.find(
        (item) =>
          item.status === RegisterStatus.registered && item.symbol.toLowerCase() === direction.from.symbol.toLowerCase()
      )?.balance ?? null,
    [direction.from.symbol, tokens]
  );

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  useEffect(() => {
    const sub$$ = from(getS2SMappingAddress(direction.from.meta.provider)).subscribe(setSpender);

    return () => sub$$.unsubscribe();
  }, [direction.from.meta.provider]);

  useEffect(() => {
    const fn = () => (data: RedeemPayload) => {
      if (!fee || !balance || !allowance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(balance, new BN(toWei(direction.from)), fee, allowance);
      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      const beforeTx = applyModalObs({
        content: <TransferConfirm value={data} fee={feeWithSymbol!}></TransferConfirm>,
      });

      const txObs = from(getS2SMappingAddress(data.direction.from.meta.provider)).pipe(
        switchMap((mappingAddress) => redeem(data, mappingAddress, String(data.direction.to.meta.specVersion)))
      );

      return createTxWorkflow(
        beforeTx,
        txObs,
        afterCrossChain(TransferDone, {
          onDisappear: () => refreshTokenBalance(direction.from.address),
          payload: data,
        })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [
    afterCrossChain,
    allowance,
    balance,
    direction.from,
    fee,
    feeWithSymbol,
    observer,
    refreshTokenBalance,
    setSubmit,
    t,
  ]);

  useEffect(() => {
    const { to: arrival } = direction;
    const api = entrance.polkadot.getInstance(arrival.meta.provider);
    const sub$$ = from(waitUntilConnected(api))
      .pipe(
        mergeMap(() => {
          const module = arrival.meta.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
          return from(api.query[module].secureLimitedRingAmount());
        })
      )
      .subscribe((result) => {
        const [spentToday, limit] = result.toJSON() as [number, number];
        const num = result && new BN(limit).sub(new BN(spentToday));

        setDailyLimit(num);
      });

    return () => sub$$.unsubscribe();
  }, [direction]);

  useEffect(() => {
    const sub$$ = from(getRedeemFee(bridge)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        const amount = fromWei({ value: result, decimals: direction.from.decimals });

        onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.decimals, direction.from.symbol, onFeeChange]);

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

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
        balance={
          balance && {
            amount: fromWei({ value: balance, decimals: direction.from.decimals }),
            symbol: direction.from.meta.tokens.find((item) => item.type === 'native' && isRing(item.symbol))!.symbol,
          }
        }
        extra={[
          {
            name: t('Allowance'),
            content: (
              <Allowance
                direction={direction}
                onChange={setAllowance}
                spender={spender}
                tokenAddress={direction.from.address}
              />
            ),
          },
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <Typography.Text>{fromWei({ value: dailyLimit, decimals: 9 }, prettyNumber)}</Typography.Text>
            ) : (
              <EyeInvisibleFilled />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
