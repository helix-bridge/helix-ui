import { CHAIN_TYPE } from './env';
import { arbitrumConfig, ethereumConfig, pangolinDVMConfig, pangoroDVMConfig } from './network';

/* eslint-disable no-magic-numbers */
export const LONG_DURATION = 10 * 1000;

export const MIDDLE_DURATION = 5 * 1000;

export const SHORT_DURATION = 3 * 1000;

export const DATE_FORMAT = 'LLL dd, yyyy';

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

export enum RecordStatus {
  pending,
  pendingToRefund,
  pendingToClaim,
  success,
  refunded,
  pendingToConfirmRefund,
  failed,
}

export enum CBridgeRecordStatus {
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

/**
 * @see https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferstatus
 * explain the reason for CBridgeRecordStatus.toBeRefunded
 */
export enum XferStatus {
  unknown,
  okToRelay,
  success,
  badLiquidity,
  badSlippage,
  badToken,
  refundRequested,
  refundDone,
  badXferDisabled,
  badDestChain,
}

const DEFAULT_FORMAL_DIRECTION = {
  from: { ...ethereumConfig.tokens[0], amount: '', meta: ethereumConfig },
  to: { ...arbitrumConfig.tokens[2], amount: '', meta: arbitrumConfig },
};

const DEFAULT_DEV_DIRECTION = {
  from: { ...pangolinDVMConfig.tokens[0], amount: '', meta: pangolinDVMConfig },
  to: { ...pangoroDVMConfig.tokens[0], amount: '', meta: pangoroDVMConfig },
};

export const DEFAULT_DIRECTION = CHAIN_TYPE === 'formal' ? DEFAULT_FORMAL_DIRECTION : DEFAULT_DEV_DIRECTION;

export const HELIX_XCM_FLAG = 204;
