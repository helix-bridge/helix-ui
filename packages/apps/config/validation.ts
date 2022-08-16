export enum TxValidationMessages {
  balanceLessThanFee = 'Insufficient balance to pay fee',
  balanceLessThanAmount = 'Insufficient balance',
  allowanceLessThanAmount = 'Insufficient allowance',
  dailyLimitLessThanAmount = 'Insufficient daily limit',
  invalidFee = 'Invalid fee',
  mustBeAnInteger = 'Transfer Amount must be integer',
}
