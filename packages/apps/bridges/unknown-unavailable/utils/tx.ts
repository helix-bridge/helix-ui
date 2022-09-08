import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { Tx } from 'shared/model';

export function issue(): Observable<Tx> {
  return EMPTY;
}

export function redeem(): Observable<Tx> {
  return EMPTY;
}
