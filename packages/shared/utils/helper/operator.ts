import { timer } from 'rxjs/internal/observable/timer';
import { last } from 'rxjs/internal/operators/last';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { scan } from 'rxjs/internal/operators/scan';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { tap } from 'rxjs/internal/operators/tap';
import type { MonoTypeOperatorFunction } from 'rxjs/internal/types';

function attemptsGuardFactory(maxAttempts: number) {
  return (attemptsCount: number) => {
    if (attemptsCount > maxAttempts) {
      throw new Error(`Exceeded max attempts: ${maxAttempts}`);
    }
  };
}

/**
 * @function pollWhile - Custom rxjs operator
 * @params  maxAttempts - polling will be canceled when attempts count reached even there is no result.
 * @params  emitOnlyLast - omit the values before the result
 * @description polling until there is a result
 */
export function pollWhile<T>(
  pollInterval: number,
  isPollingActive: (res: T) => boolean,
  maxAttempts = Infinity,
  emitOnlyLast = false
): MonoTypeOperatorFunction<T> {
  return (source$) => {
    const poll$ = timer(0, pollInterval).pipe(
      scan((attempts) => ++attempts, 0),
      tap(attemptsGuardFactory(maxAttempts)),
      mergeMap(() => source$),
      takeWhile(isPollingActive, true)
    );

    return emitOnlyLast ? poll$.pipe(last()) : poll$;
  };
}
