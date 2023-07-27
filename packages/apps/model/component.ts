import { BN } from '@polkadot/util';
import { FormInstance } from 'antd';
import { BridgeBase } from 'shared/core/bridge';
import {
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { Bridge, TokenWithAmount } from '../core/bridge';
import { CrossChainPayload } from './tx';

export interface RecordStatusComponentProps {
  record: HelixHistoryRecord;
}

export type TxConfirmComponentProps<T extends BridgeBase = BridgeBase> = { value: CrossChainPayload<T> };

export type TxDoneComponentProps<T extends BridgeBase = BridgeBase> = {
  tx: Tx;
  value: CrossChainPayload<T>;
  showHistory?: () => void;
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
  dailyLimit: DailyLimit | null;
  fee: TokenWithAmount | null;
  relayerCount?: number;
  updatePayload: React.Dispatch<
    React.SetStateAction<
      (
        v: CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>>
      ) => CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>> | null
    >
  >;
}
