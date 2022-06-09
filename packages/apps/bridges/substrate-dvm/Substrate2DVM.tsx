import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  AvailableBalance,
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  PolkadotConnection,
  TxObservableFactory,
} from 'shared/model';
import { isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { SubstrateDVMBridgeConfig, TransferPayload } from './model';
import { issuing } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

export function Substrate2DVM({
  form,
  direction,
  bridge,
  onFeeChange,
  setTxObservableFactory,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { departureConnection, departure } = useApi();
  const [balance, setBalance] = useState<AvailableBalance | null>(null);
  const getBalances = useDarwiniaAvailableBalances(departure);
  const { afterCrossChain } = useAfterTx<TransferPayload>();
  const { account } = useAccount();

  const getBalance = useCallback(
    () =>
      from(getBalances(account)).subscribe((result) => {
        const target = result.find((item) => item.symbol === direction.from.symbol);

        setBalance(target ?? null);
      }),
    [account, direction.from.symbol, getBalances]
  );

  useEffect(() => {
    const fn = () => (data: TransferPayload) => {
      const { api, type } = departureConnection as PolkadotConnection;
      if (type !== 'polkadot' || !api || !balance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(new BN(balance.balance), new BN(toWei(data.direction.from)));

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }),
        issuing(data, api),
        afterCrossChain(TransferDone, { onDisappear: getBalance, payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, departureConnection, getBalance, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = getBalance();

    return () => sub$$.unsubscribe();
  }, [getBalance]);

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
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo bridge={bridge} hideFee fee={null}></CrossChainInfo>
    </>
  );
}
