import { BN } from '@polkadot/util';
import { FormInstance } from 'antd';
import { BridgeBase } from 'shared/core/bridge';
import { BridgeState, CrossChainDirection, CrossToken, HelixHistoryRecord, Tx } from 'shared/model';
import { AllowancePayload } from '../hooks';
import { CrossChainPayload, TxObservableFactory } from './tx';

export interface RecordStatusComponentProps {
  record: HelixHistoryRecord;
}

export type TxConfirmComponentProps<T extends BridgeBase = BridgeBase> = { value: CrossChainPayload<T> };

export type TxDoneComponentProps<T extends BridgeBase = BridgeBase> = {
  tx: Tx;
  value: CrossChainPayload<T>;
};

export interface CrossChainComponentProps<
  B extends BridgeBase,
  F extends CrossToken = CrossToken,
  T extends CrossToken = CrossToken
> {
  form: FormInstance<CrossChainPayload>;
  direction: CrossChainDirection<F, T>;
  bridge: B;
  balances: BN[] | null;
  allowance: BN | null;
  // make sure page setState function direction to avoid infinite update
  setTxObservableFactory: React.Dispatch<React.SetStateAction<TxObservableFactory>>;
  setBridgeState: React.Dispatch<React.SetStateAction<BridgeState>>;
  onFeeChange: React.Dispatch<React.SetStateAction<{ amount: number; symbol: string } | null>>;
  updateAllowancePayload: React.Dispatch<React.SetStateAction<AllowancePayload | null>>;
}
