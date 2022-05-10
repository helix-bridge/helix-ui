import { EyeInvisibleFilled } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, filter, from, of, switchMap } from 'rxjs';
import { LONG_DURATION, RegisterStatus } from 'shared/config/constant';
import { useDarwiniaAvailableBalances, useIsMounted } from 'shared/hooks';
import {
  AvailableBalance,
  ConnectionStatus,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  SubmitFn,
} from 'shared/model';
import {
  applyModalObs,
  createTxWorkflow,
  fromWei,
  getKnownMappingTokens,
  isRing,
  largeNumber,
  pollWhile,
  prettyNumber,
  toWei,
} from 'shared/utils';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { useBridgeStatus } from './hooks';
import { IssuingPayload, SubstrateSubstrateDVMBridgeConfig } from './model';
import { getDailyLimit, getIssuingFee } from './utils';
import { issuing } from './utils/tx';

const validateBeforeTx = (balance: BN, amount: BN, fee: BN, limit: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.gte(amount), 'Insufficient balance'],
    [balance.gte(fee), 'Insufficient fee balance'],
    [limit.gte(amount), 'Insufficient daily limit'],
  ];

  const target = validations.find((item) => !item[0]);

  return target && target[1];
};

export function Substrate2SubstrateDVM({
  form,
  setSubmit,
  direction,
  bridge,
  setBridgeState,
  onFeeChange,
}: CrossChainComponentProps<
  SubstrateSubstrateDVMBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<DVMChainConfig>
>) {
  const { t } = useTranslation();
  const { api, network, chain, assistantConnection, connectAssistantNetwork } = useApi();
  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);

  const availableBalance = useMemo(() => {
    const balance = availableBalances[0];

    if (!balance) {
      return null;
    }

    const { max, token, ...rest } = balance;
    const result = new BN(max).sub(new BN(toWei({ value: '1', decimals: token.decimals ?? 9 }))); // keep at least 1 in account;

    return { ...rest, token, max: result.gte(new BN(0)) ? result : BN_ZERO };
  }, [availableBalances]);

  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const getBalances = useDarwiniaAvailableBalances(api, network, chain);
  const bridgeState = useBridgeStatus({ from: direction.from.meta, to: direction.to.meta });
  const { account } = useAccount();

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      },
    [direction, fee]
  );

  const isMounted = useIsMounted();

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (data: IssuingPayload) => {
      if (!api || !fee || !dailyLimit || !availableBalance?.max) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(availableBalance.max, new BN(toWei(data.direction.from)), fee, dailyLimit);

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} /> }),
        issuing(data, api, fee),
        afterCrossChain(TransferDone, {
          hashType: 'block',
          onDisappear: () => getBalances(data.sender).then(setAvailableBalances),
          payload: data,
        })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, api, availableBalance, dailyLimit, fee, feeWithSymbol, getBalances, observer, setSubmit, t]);

  useEffect(() => {
    if (assistantConnection.status !== ConnectionStatus.success) {
      connectAssistantNetwork(direction.to.meta);
      return;
    }

    const sub$$ = getKnownMappingTokens('null', { from: direction.to, to: direction.from })
      .pipe(
        filter(({ tokens }) => !!tokens.length),
        switchMap(({ tokens }) => {
          const token = tokens.find(
            (item) =>
              item.status === RegisterStatus.registered &&
              item.symbol.toLowerCase() === direction.to.symbol.toLowerCase()
          );

          return token
            ? from(getDailyLimit(token, direction)).pipe(pollWhile(LONG_DURATION, () => isMounted))
            : of(null);
        })
      )
      .subscribe((result) => {
        const num = result && new BN(result.limit).sub(new BN(result.spentToday));

        setDailyLimit(num);
      });

    return () => sub$$?.unsubscribe();
  }, [assistantConnection.status, connectAssistantNetwork, direction, isMounted]);

  useEffect(() => {
    const sub$$ = from(getIssuingFee(bridge)).subscribe((result) => {
      setFee(result);

      if (onFeeChange) {
        const amount = fromWei({ value: result, decimals: direction.from.decimals });

        onFeeChange(isRing(direction.from.symbol) ? +amount : 0);
      }
    });

    return () => sub$$.unsubscribe();
  }, [bridge, direction.from.decimals, direction.from.symbol, onFeeChange]);

  useEffect(() => {
    const subscription = from(getBalances(account)).subscribe(setAvailableBalances);

    return () => subscription.unsubscribe();
  }, [account, getBalances, setAvailableBalances]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        balance={
          availableBalance && {
            amount: fromWei(
              { value: availableBalance.max, decimals: availableBalance.token.decimals },
              // eslint-disable-next-line no-magic-numbers
              (num: string) => (+num > 1e6 ? largeNumber(num) : num),
              (num: string) => prettyNumber(num, { ignoreZeroDecimal: true })
            ),
            symbol: availableBalance.token.symbol,
          }
        }
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <Typography.Text>{fromWei({ value: dailyLimit, decimals: 9 })}</Typography.Text>
            ) : (
              <EyeInvisibleFilled />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
