import { message } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from, iif } from 'rxjs';
import { abi } from 'shared/config/abi';
import { useIsMountedOperator } from 'shared/hooks';
import { CrossChainComponentProps, CrossToken, DVMChainConfig, PolkadotChainConfig, SubmitFn } from 'shared/model';
import { applyModalObs, createTxWorkflow, entrance, fromWei, isRing, prettyNumber, toWei } from 'shared/utils';
import { WebsocketProvider } from 'web3-core';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount } from '../../providers';
import { SubstrateDVMBridgeConfig, WithdrawPayload } from './model';
import { redeem } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

async function getRingBalance(account: string, provider: string) {
  const web3 = entrance.web3.getInstance(provider);
  const currentProvider = web3.currentProvider as WebsocketProvider;

  if (currentProvider.connected) {
    return await web3.eth.getBalance(account);
  } else {
    const promise = new Promise((resolve) => {
      currentProvider.once('connected', () => {
        web3.eth.getBalance(account).then((res) => resolve(res));
      });
    });

    return promise;
  }
}

async function getKtonBalance(account: string, provider: string, ktonAddress: string) {
  const web3 = entrance.web3.getInstance(provider);
  const ktonContract = new web3.eth.Contract(abi.ktonABI, ktonAddress, { gas: 55000 });

  return await ktonContract.methods.balanceOf(account).call();
}

export function DVM2Substrate({
  form,
  direction,
  bridge,
  onFeeChange,
  setSubmit,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<WithdrawPayload>();
  const [balance, setBalance] = useState<BN | null>(null);
  const { account } = useAccount();
  const { takeWhileIsMounted } = useIsMountedOperator();

  const getBalance = useCallback(
    () =>
      iif(
        () => isRing(direction.from.symbol),
        from(getRingBalance(account, direction.from.meta.provider)),
        from(getKtonBalance(account, direction.from.meta.provider, direction.from.address))
      )
        .pipe(takeWhileIsMounted())
        .subscribe((result) => setBalance(new BN(result))),

    [account, direction.from.address, direction.from.meta.provider, direction.from.symbol, takeWhileIsMounted]
  );

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
        applyModalObs({
          content: <TransferConfirm value={data} fee={null} />,
        }),
        redeem(data),
        afterCrossChain(TransferDone, {
          payload: data,
          hashType: 'txHash',
          onDisappear: getBalance,
        })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, balance, getBalance, observer, setSubmit, t]);

  useEffect(() => {
    if (onFeeChange) {
      onFeeChange(0);
    }
  }, [onFeeChange]);

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

      <CrossChainInfo
        bridge={bridge}
        balance={
          balance && {
            amount: fromWei({ value: balance }, prettyNumber),
            symbol: direction.from.symbol,
          }
        }
        fee={null}
        hideFee
      ></CrossChainInfo>
    </>
  );
}
