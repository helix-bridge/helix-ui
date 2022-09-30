import { BN } from '@polkadot/util';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import {
  BridgeBase,
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossChainPayload,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  NullableFields,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { TxValidationMessages } from '../config/validation';
import { TxValidation } from './validation';

type GenValidationFn<T> = (params: T) => [boolean, string][];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Bridge<B extends BridgeConfig, Origin extends ChainConfig, Target extends ChainConfig>
  extends BridgeBase<B> {
  claim?(record: HelixHistoryRecord): Observable<Tx>;
  refund?(record: HelixHistoryRecord): Observable<Tx>;
  getDailyLimit?(
    direction: CrossChainDirection<CrossToken<Origin | Target>, CrossToken<Origin | Target>>
  ): Promise<DailyLimit | null>;
}

export abstract class Bridge<
  B extends BridgeConfig,
  Origin extends ChainConfig,
  Target extends ChainConfig
> extends BridgeBase<B> {
  protected readonly txValidationMessages = TxValidationMessages;

  abstract back(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<Origin>, CrossToken<Target>>,
    fee?: BN
  ): Observable<Tx>;

  abstract burn(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<Target>, CrossToken<Origin>>,
    fee?: BN
  ): Observable<Tx>;

  abstract genTxParamsValidations(params: TxValidation): [boolean, string][];

  abstract getBalance(
    direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>,
    account: string
  ): Promise<BN[]>;

  private validatorFactory<T>(genValidations: GenValidationFn<T>) {
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

  validate = this.validatorFactory(this.genTxParamsValidations);
}

export type CommonBridge = Bridge<BridgeConfig, ChainConfig, ChainConfig>;
