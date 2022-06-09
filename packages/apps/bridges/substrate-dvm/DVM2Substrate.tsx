import { message } from 'antd';
import BN from 'bn.js';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY } from 'rxjs';
import {
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { SubstrateDVMBridgeConfig, WithdrawPayload } from './model';
import { redeem } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

export function DVM2Substrate({
  form,
  direction,
  bridge,
  onFeeChange,
  balance,
  setTxObservableFactory,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<DVMChainConfig>, CrossToken<PolkadotChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<WithdrawPayload>();

  useEffect(() => {
    const fn = () => (data: WithdrawPayload) => {
      if (!balance) {
        return EMPTY;
      }

      const msg = validateBeforeTx(balance as BN, new BN(toWei(data.direction.from)));

      if (msg) {
        message.error(t(msg));
        return EMPTY;
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }),
        redeem(data),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, setTxObservableFactory, t]);

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
