import { Observable, EMPTY } from 'rxjs';
import { Tx } from 'shared/model';

export function issue(): Observable<Tx> {
  return EMPTY;
}

export function redeem(): Observable<Tx> {
  return EMPTY;
}
