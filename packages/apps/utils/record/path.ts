import { HelixHistoryRecord } from 'shared/model';
import {
  BridgePredicateFn,
  isCBridge,
  isSubstrateDVM,
  isSubstrateDVMEthereum,
  isSubstrateDVMSubstrateDVM,
  isSubstrateSubstrateDVM,
  isSubstrateSubstrateParachain,
  isXCM,
} from '../bridge';
import { getDirectionFromHelixRecord } from './record';

type DirectionPaths = [BridgePredicateFn, string, string];

/**
 * TODO: remove this function.
 */
export function getDetailPaths(record: HelixHistoryRecord): string[] {
  const { fromChain, toChain } = record;
  const direction = getDirectionFromHelixRecord(record);
  const filters: DirectionPaths[] = [
    [isSubstrateSubstrateDVM, 's2s', record.id],
    [isSubstrateDVM, 's2dvm', record.id],
    [isSubstrateSubstrateParachain, 's2parachain', record.id],
    [() => !!direction && isCBridge(direction), 'cbridge', record.id],
    [() => !!direction && isXCM(direction), 'xcm', record.id],
    [isSubstrateDVMSubstrateDVM, 's2sv2', record.id],
    [isSubstrateDVMEthereum, 'eth2', record.id],
  ];

  const result = filters.find(([predicate]) => predicate(fromChain, toChain));

  return result ? (result.slice(1) as string[]) : [];
}
