import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { hexToU8a } from '@polkadot/util';
import { lastValueFrom, map } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { Network, PolkadotChainConfig } from '../../model';
import { remove0x } from '../helper';
import { convert } from '../mmrConvert/ckb_merkle_mountain_range_bg';
import { getChainConfigByName, waitUntilConnected } from '../network';
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
  query nodeEntities($ids: [String!]) {
    nodeEntities(filter: { id: { in: $ids } }) {
      nodes {
        id
        hash
      }
    }
  }
`;

async function getMMRProofByRPC(api: ApiPromise, blockNumber: number, mmrBlockNumber: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proof = await (api.rpc as any).headerMMR.genProof(blockNumber, mmrBlockNumber);
  const proofStr = proof.proof.substring(1, proof.proof.length - 1); // remove '[' and ']'
  const proofHexStr: string[] = proofStr.split(',').map((item: string) => {
    return remove0x(item.replace(/(^\s*)|(\s*$)/g, ''));
  });
  const encodeProof = proofHexStr.join('');

  return { encodeProof, size: proof.mmrSize as BigInt };
}

async function getMMRProofBySubql(api: ApiPromise, blockNumber: number, mmrBlockNumber: number) {
  const chain = (await api.rpc.system.chain()).toString().toLowerCase() as Extract<Network, 'pangolin' | 'darwinia'>;
  const config = getChainConfigByName(chain) as PolkadotChainConfig;
  const fetchProofs = proofsFactory(config.endpoints.mmr);
  const proof = await genProof(blockNumber, mmrBlockNumber, fetchProofs);
  const encodeProof = proof.proof.map((item) => remove0x(item.replace(/(^\s*)|(\s*$)/g, ''))).join('');
  const size = new TypeRegistry().createType('u64', proof.mmrSize.toString()) as unknown as BigInt;

  return { encodeProof, size };
}

function proofsFactory(url: string) {
  return (ids: number[]): Promise<string[]> => {
    const obs = ajax
      .post<{ data: { nodeEntities: { nodes: { hash: string; id: string }[] } } }>(
        url,
        { query: MMR_QUERY, variables: { ids: ids.map((item) => item.toString()) } },
        { 'Content-Type': 'application/json', accept: 'application/json' }
      )
      .pipe(
        map((res) => {
          const nodes = res.response.data.nodeEntities.nodes;

          return ids.reduce((acc: string[], id: number) => {
            const target = nodes.find((node) => +node.id === id);

            return target ? [...acc, target.hash] : acc;
          }, []);
        })
      );

    return lastValueFrom(obs);
  };
}

export function encodeMMRRootMessage(root: EncodeMMRoot) {
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
  blockHash: string,
  byRPC = false
): Promise<MMRProof> {
  await waitUntilConnected(api);

  const getProof = byRPC ? getMMRProofByRPC : getMMRProofBySubql;
  const { encodeProof, size } = await getProof(api, blockNumber, mmrBlockNumber);
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
