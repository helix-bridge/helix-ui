export interface Paginator {
  row: number;
  page: number;
}

export interface RecordRequestParams {
  address: string;
  paginator: Paginator;
  confirmed: boolean | null;
}

export enum RecordStatus {
  pending = 'pending',
  success = 'success',
  reverted = 'reverted',
}
