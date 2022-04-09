import { last, MonoTypeOperatorFunction, scan, switchMapTo, takeWhile, tap, timer } from 'rxjs';

function attemptsGuardFactory(maxAttempts: number) {
  return (attemptsCount: number) => {
    if (attemptsCount > maxAttempts) {
      throw new Error(`Exceeded maxAttempts: ${maxAttempts}, actual attempts: ${attemptsCount}`);
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
      switchMapTo(source$),
      takeWhile(isPollingActive, true)
    );

    return emitOnlyLast ? poll$.pipe(last()) : poll$;
  };
}
