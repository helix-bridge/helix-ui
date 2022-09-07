import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import { EMPTY, Observable, of, switchMap, throwError } from 'rxjs';
import { NullableFields, Tx } from 'shared/model';

type GenValidationFn<T> = (params: T) => [boolean, string][];

export function validationObsFactory<T>(genValidations: GenValidationFn<T>) {
  const validate = (data: ReturnType<GenValidationFn<T>>) => {
    const target = data.find((item) => item[0]);

    return target && target[1];
  };

  return (checkedValues: unknown[], params: NullableFields<T, keyof T>): Observable<boolean> => {
    const result = checkedValues.every((value) => !!value) && validate(genValidations(params as T));

    return of(result).pipe(
      switchMap((res) => {
        if (isString(res)) {
          return throwError(() => <Pick<Tx, 'error' | 'status'>>{ error: new Error(res), status: 'error' });
        } else if (isBoolean(res)) {
          return EMPTY;
        } else {
          return of(true);
        }
      })
    );
  };
}
