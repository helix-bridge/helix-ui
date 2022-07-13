import { message } from 'antd';
import { isBoolean, isString } from 'lodash';
import { TFunction } from 'react-i18next';
import { EMPTY, Observable } from 'rxjs';
import { NullableFields, Tx } from 'shared/model';

export function txValidatorFactory<T>(validator: (params: T) => string | undefined) {
  return (checkedValues: unknown[], params: NullableFields<T, keyof T>) => {
    return checkedValues.every((value) => !!value) && validator(params as T);
  };
}

export function getTxObservable(
  validateResult: string | boolean | undefined,
  txObsCreator: () => Observable<Tx>,
  t: TFunction
): Observable<Tx> {
  if (isString(validateResult)) {
    message.error(t(validateResult));
    return EMPTY;
  } else if (isBoolean(validateResult)) {
    return EMPTY;
  } else {
    return txObsCreator();
  }
}
