import { useCallback, useEffect, useRef } from 'react';
import { Observable, takeWhile } from 'rxjs';

export function useIsMounted() {
  const ref = useRef(true);

  useEffect(
    () => () => {
      ref.current = false;
    },
    []
  );

  return ref.current;
}

type OperatorHook = <T>() => (source: Observable<T>) => Observable<T>;

export function useIsMountedOperator() {
  const isMounted = useIsMounted();

  const takeWhileIsMounted = useCallback<OperatorHook>(() => {
    return function <T>(source: Observable<T>) {
      return source.pipe(takeWhile(() => isMounted));
    };
  }, [isMounted]);

  return { takeWhileIsMounted };
}
