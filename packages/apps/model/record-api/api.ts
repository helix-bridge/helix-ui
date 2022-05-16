import { Arrival, Departure } from 'shared/model';

export interface Paginator {
  row: number;
  page: number;
}

export interface RecordRequestParams {
  address: string;
  direction: [Departure, Arrival];
  paginator: Paginator;
  confirmed: boolean | null;
}

export enum RecordStatus {
  pending = 'pending',
  success = 'success',
  reverted = 'reverted',
}
