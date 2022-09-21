import type { ApiPromise } from '@polkadot/api';
import { hexToU8a } from '@polkadot/util';
import { ajax } from 'rxjs/ajax';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { map } from 'rxjs/internal/operators/map';
import { Network, PolkadotChainConfig } from 'shared/model';
import { waitUntilConnected } from 'shared/utils/connection';
import { remove0x } from 'shared/utils/helper/address';
import { typeRegistryFactory } from 'shared/utils/helper/huge';
import { convert, updateInstance } from '../mmrConvert/ckb_next';
import { getChainConfig } from '../network';
import { genProof } from './proof';

interface EncodeMMRoot {
  prefix: ClaimNetworkPrefix;
  methodID: string;
  index: number;
  root: string;
}

export interface MMRProof {
  mmrSize: string;
  peaks: string[];
  siblings: string[];
}

export type ClaimNetworkPrefix = 'Darwinia' | 'Pangolin';

/**
 * subql subql-darwinia-mmr subql-pangolin-mmr
 */
const MMR_QUERY = `
  query mMRNodeEntities($ids: [String!]) {
    mMRNodeEntities(filter: { id: { in: $ids } }) {
      nodes {
        id
        hash
      }
    }
  }
`;

async function getMMRProofBySubql(api: ApiPromise, blockNumber: number, mmrBlockNumber: number) {
  const chain = (await api.rpc.system.chain()).toString().toLowerCase() as Extract<Network, 'pangolin' | 'darwinia'>;
  const config = getChainConfig(chain) as PolkadotChainConfig;
  const fetchProofs = proofsFactory(`https://api.subquery.network/sq/darwinia-network/subql-mmr-${config.name}`);
  const TypeRegistry = await typeRegistryFactory();
  const proof = await genProof(blockNumber, mmrBlockNumber, fetchProofs, TypeRegistry);
  const encodeProof = proof.proof.map((item) => remove0x(item.replace(/(^\s*)|(\s*$)/g, ''))).join('');
  const size = new TypeRegistry().createType('u64', proof.mmrSize.toString()) as unknown as bigint;

  return { encodeProof, size };
}

function proofsFactory(url: string) {
  return (ids: number[]): Promise<string[]> => {
    const obs = ajax
      .post<{ data: { mMRNodeEntities: { nodes: { hash: string; id: string }[] } } }>(
        url,
        { query: MMR_QUERY, variables: { ids: ids.map((item) => item.toString()) } },
        { 'Content-Type': 'application/json', accept: 'application/json' }
      )
      .pipe(
        map((res) => {
          const nodes = res.response.data.mMRNodeEntities.nodes;

          return ids.reduce((acc: string[], id: number) => {
            const target = nodes.find((node) => +node.id === id);

            return target ? [...acc, target.hash] : acc;
          }, []);
        })
      );

    return lastValueFrom(obs);
  };
}

export async function encodeMMRRootMessage(root: EncodeMMRoot) {
  const TypeRegistry = await typeRegistryFactory();
  const registry = new TypeRegistry();

  return registry.createType(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    '{"prefix": "Vec<u8>", "methodID": "[u8; 4; methodID]", "index": "Compact<u32>", "root": "H256"}' as any,
    root
  );
}

export async function getMMR(
  api: ApiPromise,
  blockNumber: number,
  mmrBlockNumber: number,
  blockHash: string
): Promise<MMRProof> {
  await waitUntilConnected(api);
  const instance = await import('../mmrConvert/ckb_merkle_mountain_range_bg.wasm');

  updateInstance(instance);

  const { encodeProof, size } = await getMMRProofBySubql(api, blockNumber, mmrBlockNumber);
  const mmrProofConverted: string = convert(blockNumber, size, hexToU8a('0x' + encodeProof), hexToU8a(blockHash));
  const [mmrSize, peaksStr, siblingsStr] = mmrProofConverted.split('|');
  const peaks = peaksStr.split(',');
  const siblings = siblingsStr.split(',');

  return {
    mmrSize,
    peaks,
    siblings,
  };
}