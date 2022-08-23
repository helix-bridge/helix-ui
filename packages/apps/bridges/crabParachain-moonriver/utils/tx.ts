import { Observable, EMPTY } from 'rxjs';
import { RequiredPartial, Tx } from 'shared/model';
import { fromWei } from 'shared/utils/helper';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';

export function issuing(payload: IssuingPayload): Observable<Tx> {
  console.log('🚀 ~ file: tx.ts ~ line 10 ~ issuing ~ payload', payload);
  return EMPTY;
}

export function redeem(payload: RedeemPayload): Observable<Tx> {
  console.log('🚀 ~ file: tx.ts ~ line 14 ~ redeem ~ payload', payload);
  return EMPTY;
}

const genValidations = ({
  balance,
  amount,
}: RequiredPartial<TxValidation, 'balance' | 'amount'>): [boolean, string][] => {
  const decimals = +fromWei({ value: amount });

  return [
    [!Number.isInteger(decimals), TxValidationMessages.mustBeAnInteger],
    [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  ];
};

export const validate = validationObsFactory(genValidations);
