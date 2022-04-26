import { ICamelCaseKeys } from '../camelCaseKeys';
import { ChainConfig } from '../network';

export interface RecordComponentProps<T, D = ChainConfig, A = ChainConfig> {
  record: ICamelCaseKeys<T>;
  departure: D | null;
  arrival: A | null;
}
