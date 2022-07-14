import { EyeInvisibleFilled } from '@ant-design/icons';
import { BN_ZERO } from '@polkadot/util';
import { Typography } from 'antd';
import BN from 'bn.js';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { from, mergeMap, switchMap } from 'rxjs';
import {
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { fromWei, isRing, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { getS2SMappingAddress } from 'shared/utils/mappingToken';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount } from '../../providers';
import { useBridgeStatus } from './hooks';
import { RedeemPayload, SubstrateSubstrateDVMBridgeConfig } from './model';
import { getRedeemFee } from './utils';
import { redeem, validate } from './utils/tx';

export function SubstrateDVM2Substrate({
  allowance,
  form,
  bridge,
  direction,
  balances,
  onFeeChange,
  setTxObservableFactory,
  setBridgeState,
  updateAllowancePayload,
}: CrossChainComponentProps<
  SubstrateSubstrateDVMBridgeConfig,
  CrossToken<DVMChainConfig>,
  CrossToken<PolkadotChainConfig>
>) {
  const { t } = useTranslation();
  const bridgeState = useBridgeStatus(direction);
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
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
    const sub$$ = from(getS2SMappingAddress(direction.from.meta.provider)).subscribe((spender) => {
      updateAllowancePayload({ spender, tokenAddress: direction.from.address });
    });

    return () => sub$$.unsubscribe();
  }, [direction.from.address, direction.from.meta.provider, updateAllowancePayload]);

  useEffect(() => {
    const fn = () => (data: RedeemPayload) => {
      const validateObs = validate([fee, balances, allowance], {
        balance: balances ? balances[0] : BN_ZERO,
        amount: new BN(toWei(direction.from)),
        allowance,
        fee,
      });

      const beforeTx = validateObs.pipe(
        mergeMap(() =>
          applyModalObs({
            content: <TransferConfirm value={data} fee={feeWithSymbol!}></TransferConfirm>,
          })
        )
      );

      const txObs = from(getS2SMappingAddress(data.direction.from.meta.provider)).pipe(
        switchMap((mappingAddress) => redeem(data, mappingAddress, String(data.direction.to.meta.specVersion)))
      );

      return createTxWorkflow(beforeTx, txObs, afterCrossChain(TransferDone, { payload: data }));
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [account, afterCrossChain, allowance, balances, direction.from, fee, feeWithSymbol, setTxObservableFactory, t]);

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
        const data = result.toJSON() as [number, number];
        const num = result && new BN(data[1]);

        setDailyLimit(num);
      });

    return () => sub$$.unsubscribe();
  }, [direction]);

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
          {
            name: t('Daily limit'),
            content: dailyLimit ? (
              <Typography.Text>
                {dailyLimit.isZero()
                  ? t('Infinite')
                  : fromWei({ value: dailyLimit, decimals: 9 }, (val: string) =>
                      prettyNumber(val, { ignoreZeroDecimal: true })
                    )}
              </Typography.Text>
            ) : (
              <EyeInvisibleFilled />
            ),
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
