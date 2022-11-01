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
    [isSubstrateSubstrateDVM, 'helix/s2s', record.id],
    [isSubstrateDVM, 'helix/s2dvm', record.id],
    [isSubstrateSubstrateParachain, 'helix/s2parachain', record.id],
    [() => !!direction && isCBridge(direction), 'cbridge', record.id],
    [() => !!direction && isXCM(direction), 'xcm', record.id],
    [isSubstrateDVMSubstrateDVM, 'helix/s2sv2', record.id],
    [isSubstrateDVMEthereum, 'helix/eth2', record.id],
  ];

  const result = filters.find(([predicate]) => predicate(fromChain, toChain));

  return result ? (result.slice(1) as string[]) : [];
}
