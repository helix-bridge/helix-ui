import { BN } from '@polkadot/util';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { BridgeBase } from 'shared/core/bridge';
import {
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  Network,
  NullableFields,
  Tx,
} from 'shared/model';
import { TxValidationMessages } from '../config/validation';
import { CrossChainPayload } from '../model/tx';
import { TxValidation } from '../model/validation';

type GenValidationFn<T> = (params: T) => [boolean, string][];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Bridge<B extends BridgeConfig, Origin extends ChainConfig, Target extends ChainConfig>
  extends BridgeBase<B, Origin, Target> {
  claim?(record: HelixHistoryRecord): Observable<Tx>;
  refund?(record: HelixHistoryRecord): Observable<Tx>;
  getDailyLimit?(
    direction: CrossChainDirection<CrossToken<Origin | Target>, CrossToken<Origin | Target>>
  ): Promise<DailyLimit | null>;
  getFee?(direction: CrossChainDirection<CrossToken<Origin | Target>, CrossToken<Origin | Target>>): Promise<BN>;
}

export abstract class Bridge<
  B extends BridgeConfig,
  Origin extends ChainConfig,
  Target extends ChainConfig
> extends BridgeBase<B, Origin, Target> {
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

  validate = this.validatorFactory(this.genTxParamsValidations.bind(this));

  getChainConfig(name: Network): Origin | Target {
    if (!name) {
      throw new Error(`You must pass a 'name' parameter to find the chain config`);
    }

    const result = [this.departure, this.arrival].find((item) => item.name === name);

    if (!result) {
      throw new Error(`Can not find the chain config by ${name}`);
    }

    return result;
  }
}

export type CommonBridge = Bridge<BridgeConfig, ChainConfig, ChainConfig>;