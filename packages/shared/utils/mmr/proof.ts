import { isUndefined, negate } from 'lodash';
import { leaf_index_to_pos, leaf_index_to_mmr_size, get_peaks, gen_proof_for_peak, bag_rhs_peaks } from './util';

interface RpcMMRProof {
  mmrSize: number;
  proof: string[];
}

// eslint-disable-next-line complexity
async function gen_proof(
  leaf_index: number,
  last_leaf_index: number,
  query: (peak_pos: number[]) => Promise<string[]>
): Promise<RpcMMRProof> {
  const leaf_pos = leaf_index_to_pos(leaf_index);
  const mmr_size = leaf_index_to_mmr_size(last_leaf_index);

  if (mmr_size === 1 && leaf_pos === 0) {
    return { mmrSize: 0, proof: [] };
  }

  const peaks = get_peaks(mmr_size);
  let proof: string[] = [];

  // generate merkle proof for each peaks
  let bagging_track = 0;
  let found = false;

  for (const peak_pos of peaks) {
    if (!found && leaf_pos <= peak_pos) {
      const pos_proofs = gen_proof_for_peak(leaf_pos, peak_pos);

      found = true;
      bagging_track = 0;

      const res = await query(pos_proofs);

      proof = [...proof, ...res];
    } else {
      bagging_track += 1;

      const res = await query([peak_pos]);

      proof = [...proof, ...res];
    }
  }

  if (bagging_track > 1) {
    const index = proof.length - bagging_track;
    const rhs_peaks = proof.slice(index);

    proof = [...proof.slice(0, index), bag_rhs_peaks(rhs_peaks)];
  }

  return { mmrSize: mmr_size, proof: proof.filter(negate(isUndefined)) };
}

export const genProof = gen_proof;
