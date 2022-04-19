/* eslint-disable no-magic-numbers */
export const LONG_DURATION = 10 * 1000;

export const MIDDLE_DURATION = 5 * 1000;

export const SHORT_DURATION = 3 * 1000;

export const DATE_FORMAT = 'yyyy/MM/dd';

// export const DATE_TIME_FORMAT = 'yyyy/MM/dd HH:mm:ss';

export enum Path {
  root = '/',
  register = '/register',
  transaction = '/transaction',
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

export enum CrossChainStatusColor {
  '#00b3ff',
  '#00AA76',
  '#EC9D00',
}
