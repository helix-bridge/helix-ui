import { Observable } from 'rxjs';
import { Tx } from '../../../model';

export function issuing(): Observable<Tx> {}

export function redeem(): Observable<Tx> {}
