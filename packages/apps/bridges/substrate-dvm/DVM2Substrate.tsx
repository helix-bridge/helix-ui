import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { useIsMountedOperator } from 'shared/hooks';
import {
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { isKton, isRing, toWei } from 'shared/utils/helper';
import { getDVMBalance } from 'shared/utils/network/balance';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount } from '../../providers';
import { SubstrateDVMBridgeConfig, WithdrawPayload } from './model';
import { redeem } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

export function DVM2Substrate({
  form,
  direction,
  bridge,
  onFeeChange,
  setTxObservableFactory,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<WithdrawPayload>();
  const [balance, setBalance] = useState<BN | null>(null);
  const { account } = useAccount();
  const { takeWhileIsMounted } = useIsMountedOperator();

  const getBalance = useCallback(() => {
    if (!account) {
      setBalance(null);

      return EMPTY.subscribe();
    }

    const kton = direction.from.meta.tokens.find((item) => isKton(item.symbol) && item.type === 'native')!;
    const source = from(getDVMBalance(kton.address, account));

    return source.pipe(takeWhileIsMounted()).subscribe((result) => {
      setBalance(new BN(result[0])); // kton transfer implemented in apps.
    });
  }, [account, direction.from.meta.tokens, takeWhileIsMounted]);

  useEffect(() => {
    const sub$$ = getBalance();

    return () => sub$$.unsubscribe();
  }, [getBalance]);

  useEffect(() => {
    const fn = () => (data: WithdrawPayload) => {
      if (!balance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(balance, new BN(toWei(data.direction.from)));

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }),
        redeem(data),
        afterCrossChain(TransferDone, { payload: data, onDisappear: getBalance })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, getBalance, setTxObservableFactory, t]);

  useEffect(() => {
    if (onFeeChange) {
      onFeeChange({
        amount: 0,
        symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
      });
    }
  }, [direction.from.meta.tokens, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
          { type: 'Substrate' }
        )}
      />

      <CrossChainInfo bridge={bridge} fee={null} hideFee></CrossChainInfo>
    </>
  );
}
