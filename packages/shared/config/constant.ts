import { CHAIN_TYPE } from './env';
import { darwiniaConfig, ethereumConfig, pangolinConfig, ropstenConfig } from './network';

/* eslint-disable no-magic-numbers */
export const LONG_DURATION = 10 * 1000;

export const MIDDLE_DURATION = 5 * 1000;

export const SHORT_DURATION = 3 * 1000;

export const DATE_FORMAT = 'yyyy/MM/dd';

export const DATE_TIME_FORMAT = 'yyyy/MM/dd HH:mm:ss';

export enum FORM_CONTROL {
  recipient = 'recipient',
  sender = 'sender',
  direction = 'direction',
  bridge = 'bridge',
  slippage = 'slippage',
}

export enum RegisterStatus {
  unregister,
  registered,
  registering,
}

export enum CrossChainStatus {
  pending,
  success,
  reverted,
}

export enum CBridgeHistoryStatus {
  unknown,
  submitting,
  failed,
  waitingForSgnConfirmation,
  waitingForFundRelease,
  completed,
  toBeRefunded,
  requestingRefund,
  refundToBeConfirmed,
  confirmingYourRefund,
  refunded,
}

// TODO: implement by tailwindcss ?
export enum CrossChainStatusColor {
  '#00b3ff',
  '#00AA76',
  '#EC9D00',
  '#00b3fe',
  '#00b3fd',
  '#00AA75',
  '#EC9D01',
  '#00b3fc',
  '#00b3fb',
  '#00b3fa',
  '#00AA74',
}

const DEFAULT_FORMAL_DIRECTION = {
  from: { ...darwiniaConfig.tokens[0], amount: '', meta: darwiniaConfig },
  to: { ...ethereumConfig.tokens[1], amount: '', meta: ethereumConfig },
};

const DEFAULT_DEV_DIRECTION = {
  from: { ...pangolinConfig.tokens[0], amount: '', meta: pangolinConfig },
  to: { ...ropstenConfig.tokens[1], amount: '', meta: ropstenConfig },
};

export const DEFAULT_DIRECTION = CHAIN_TYPE === 'formal' ? DEFAULT_FORMAL_DIRECTION : DEFAULT_DEV_DIRECTION;

export const GENESIS_ADDRESS = '0x0000000000000000000000000000000000000000';
