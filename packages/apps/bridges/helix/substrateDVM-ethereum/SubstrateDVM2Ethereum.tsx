import { BN } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { FORM_CONTROL, LONG_DURATION } from 'shared/config/constant';
import { useIsMounted } from 'shared/hooks';
import { CrossToken, DVMChainConfig, EthereumChainConfig } from 'shared/model';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { isNativeToken } from 'shared/utils/helper/validator';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CountLoading } from '../../../components/widget/CountLoading';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx, useCheckSpecVersion } from '../../../hooks';
import { CrossChainComponentProps } from '../../../model/component';
import { TxObservableFactory } from '../../../model/tx';
import { useAccount } from '../../../providers';
import { isEthereum2SubstrateDVM, isSubstrateDVM2Ethereum } from '../../../utils';
import { getWrappedToken } from '../../../utils/token';
import { IssuingPayload, RedeemPayload } from './model';
import { SubstrateDVMEthereumBridge } from './utils/bridge';

export function SubstrateDVM2Ethereum({
  form,
  setTxObservableFactory,
  onFeeChange,
  direction,
  bridge,
  balances,
  updateAllowancePayload,
  setBridgeState,
}: CrossChainComponentProps<SubstrateDVMEthereumBridge, CrossToken<EthereumChainConfig>, CrossToken<DVMChainConfig>>) {
  const bridgeState = useCheckSpecVersion(direction);
  const { t } = useTranslation();
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<IssuingPayload | RedeemPayload>();
  const { account } = useAccount();
  const [balance, nativeBalance] = (balances ?? []) as BN[];

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.from.decimals }),
        symbol: direction.from.meta.tokens.find(isNativeToken)!.symbol,
      },
    [direction.from.decimals, direction.from.meta.tokens, fee]
  );

  const isMounted = useIsMounted();

  useEffect(() => {
    if (isEthereum2SubstrateDVM(direction.from.meta.name, direction.to.meta.name)) {
      setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
    }
  }, [bridgeState.status, bridgeState.reason, setBridgeState, direction.from.meta.name, direction.to.meta.name]);

  useEffect(() => {
    if (direction.from.type === 'mapping' && isSubstrateDVM2Ethereum(direction.from.host, direction.to.host)) {
      updateAllowancePayload({
        spender: bridge.config.contracts.backing,
        tokenAddress: direction.from.address || getWrappedToken(direction.from.meta).address,
      });
    }

    if (isEthereum2SubstrateDVM(direction.from.host, direction.to.host)) {
      updateAllowancePayload({
        spender: bridge.config.contracts.issuing,
        tokenAddress: direction.from.address,
      });
    }
  }, [
    bridge.config.contracts.backing,
    bridge.config.contracts.issuing,
    direction.from.address,
    direction.from.host,
    direction.from.meta,
    direction.from.type,
    direction.to.host,
    updateAllowancePayload,
  ]);

  useEffect(() => {
    const fn = () => (data: IssuingPayload | RedeemPayload) => {
      const validateObs = data.bridge.validate([fee, dailyLimit, balance, nativeBalance], {
        balance,
        amount: new BN(toWei(data.direction.from)),
        dailyLimit,
        fee,
        feeTokenBalance: nativeBalance,
      });
      const isIssue = isSubstrateDVM2Ethereum(data.direction.from.host, data.direction.to.host);

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() =>
            applyModalObs({ content: <TransferConfirm value={data} fee={feeWithSymbol!} needClaim={isIssue} /> })
          )
        ),
        () =>
          isIssue ? data.bridge.back(data as IssuingPayload, fee!) : data.bridge.burn(data as RedeemPayload, fee!),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, dailyLimit, fee, nativeBalance, feeWithSymbol, balance, setTxObservableFactory]);

  useEffect(() => {
    const sub$$ = from(bridge.getFee(direction))
      .pipe(pollWhile(LONG_DURATION, () => isMounted))
      .subscribe({
        next(result) {
          setFee(result);

          if (onFeeChange) {
            onFeeChange({
              amount: +fromWei({ value: result, decimals: direction.from.decimals }),
              symbol: direction.from.meta.tokens.find(isNativeToken)!.symbol,
            });
          }
        },
        error(error) {
          console.warn('🚀 ~ file: SubstrateDVM2Ethereum.tsx ~ line 127 ~ error ~ error', error);
        },
      });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, isMounted, onFeeChange]);

  useEffect(() => {
    const sub$$ = from(bridge.getDailyLimit(direction))
      .pipe(pollWhile(LONG_DURATION, () => isMounted))
      .subscribe({
        next(res) {
          setDailyLimit(res && new BN(res.limit));
        },
        error(error) {
          console.warn('🚀 ~ file: SubstrateDVM2Ethereum.tsx ~ line 136 ~ error ~ error', error);
        },
      });

    return () => sub$$?.unsubscribe();
  }, [bridge, direction, isMounted]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  return (
    <>
      <div className="hidden">
        <RecipientItem
          form={form}
          direction={direction}
          bridge={bridge}
          extraTip={t(
            'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
          )}
        />
      </div>

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        extra={[
          {
            name: t('Daily limit'),
            content: dailyLimit ? <span>{fromWei({ value: dailyLimit })}</span> : <CountLoading />,
          },
        ]}
      ></CrossChainInfo>
    </>
  );
}
