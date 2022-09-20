import { Network, HelixHistoryRecord } from 'shared/model';
import {
  BridgePredicateFn,
  isSubstrateSubstrateDVM,
  isSubstrateDVM,
  isSubstrateSubstrateParachain,
  isCBridge,
  isXCM,
  isSubstrateDVMSubstrateDVM,
  isSubstrateDVMEthereum,
} from '../../../apps/utils/bridge';

type DirectionPaths = [BridgePredicateFn, string, string];

export function getDetailPaths(fromChain: Network, toChain: Network, record: HelixHistoryRecord): string[] {
  const filters: DirectionPaths[] = [
    [isSubstrateSubstrateDVM, 's2s', record.id],
    [isSubstrateDVM, 's2dvm', record.id],
    [isSubstrateSubstrateParachain, 's2parachain', record.id],
    [isCBridge, 'cbridge', record.id],
    [isXCM, 'xcm', record.id],
    [isSubstrateDVMSubstrateDVM, 's2sv2', record.id],
    [isSubstrateDVMEthereum, 'eth2', record.id],
  ];

  const result = filters.find(([predicate]) => predicate(fromChain as Network, toChain as Network));

  return result ? (result.slice(1) as string[]) : [];
}
