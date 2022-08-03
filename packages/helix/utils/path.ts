import { HelixHistoryRecord, Network } from 'shared/model';
import {
  BridgePredicateFn,
  isCrabDVMHeco,
  isCrabDVMEthereum,
  isCrabDVMPolygon,
  isParachainSubstrate,
  isSubstrateDVM,
  isSubstrateSubstrateDVM,
} from 'shared/utils/bridge';

type DirectionPaths = [BridgePredicateFn, string, string];

export function getDetailPaths(fromChain: Network, toChain: Network, record: HelixHistoryRecord): string[] {
  const filters: DirectionPaths[] = [
    [isSubstrateSubstrateDVM, 's2s', record.id],
    [isSubstrateDVM, 's2dvm', record.id],
    [isParachainSubstrate, 's2parachain', record.id],
    [isCrabDVMHeco, 'cbridge', record.id],
    [isCrabDVMEthereum, 'cbridge', record.id],
    [isCrabDVMPolygon, 'cbridge', record.id],
  ];
  const result = filters.find(([predicate]) => predicate(fromChain, toChain));

  return result ? (result.slice(1) as string[]) : [];
}
