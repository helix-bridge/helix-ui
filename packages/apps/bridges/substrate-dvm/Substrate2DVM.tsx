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
import { useApi } from '../../providers';
import { SubstrateDVMBridgeConfig, TransferPayload } from './model';
import { issuing } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

export function Substrate2DVM({
  form,
  direction,
  bridge,
  balance: balances,
  onFeeChange,
  setTxObservableFactory,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { departureConnection } = useApi();
  const { afterCrossChain } = useAfterTx<TransferPayload>();
  const [balance] = (balances ?? []) as BN[];

  useEffect(() => {
    const fn = () => (data: TransferPayload) => {
      const { api, type } = departureConnection as PolkadotConnection;
      if (type !== 'polkadot' || !api || !balance) {
        return EMPTY;
      }

      const msg = validateBeforeTx(balance, new BN(toWei(data.direction.from)));

      if (msg) {
        message.error(t(msg));
        return EMPTY;
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }),
        issuing(data, api),
        afterCrossChain(TransferDone, { payload: data })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balance, departureConnection, setTxObservableFactory, t]);

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
