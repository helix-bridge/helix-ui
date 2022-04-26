import { Arrival, Departure } from '@helix/shared/model';

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
