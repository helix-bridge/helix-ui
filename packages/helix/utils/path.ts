import { HelixHistoryRecord, Network } from 'shared/model';
import { BridgePredicateFn, isParachainSubstrate, isSubstrateDVM, isSubstrateSubstrate } from 'shared/utils/bridge';

type DirectionPaths = [BridgePredicateFn, string, string];

export function getDetailPaths(fromChain: Network, toChain: Network, record: HelixHistoryRecord): string[] {
  const radix = 16;
  const filters: DirectionPaths[] = [
    [isSubstrateSubstrate, 's2s', record.laneId + '0x' + Number(record.nonce).toString(radix)],
    [isSubstrateDVM, 's2dvm', record.id],
    [isParachainSubstrate, 's2parachain', record.id],
  ];
  const result = filters.find(([predicate]) => predicate(fromChain, toChain));

  return result ? (result.slice(1) as string[]) : [];
}
