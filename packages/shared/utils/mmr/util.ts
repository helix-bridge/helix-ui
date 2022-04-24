/* eslint-disable no-bitwise */
/* eslint-disable complexity */
/* eslint-disable no-magic-numbers */
import { Raw, Tuple, TypeRegistry } from '@polkadot/types';
import { hexToU8a } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

// export function merge(left: string, right: string): string {
//   const res = blake2b(Uint8Array.from(Buffer.from(left + right, 'hex')), undefined, 32);

//   return Buffer.from(res).toString('hex');
// }

const registry = new TypeRegistry();

function merge(left: string, right: string): string {
  const res = new Tuple(registry, [Raw, Raw], [new Raw(registry, hexToU8a(left)), new Raw(registry, hexToU8a(right))]);

  return blake2AsHex(res.toU8a());
}

export function leaf_index_to_pos(index: number): number {
  // mmr_size - H - 1, H is the height(intervals) of last peak
  return leaf_index_to_mmr_size(index) - trailing_zeros(index + 1) - 1;
}

export function leaf_index_to_mmr_size(index: number): number {
  // leaf index start with 0
  const leaves_count = index + 1;

  // the peak count(k) is actually the count of 1 in leaves count's binary representation
  const peak_count = calcCount(leaves_count, '1');

  return 2 * leaves_count - peak_count;
}

function pos_height_in_tree(pos: number): number {
  pos += 1;

  while (!all_ones(pos)) {
    pos = jump_left(pos);
  }

  return 64 - leading_zeros(pos) - 1;
}

export function get_peaks(mmr_size: number): number[] {
  const pos_s: number[] = [];
  let [height, pos] = left_peak_height_pos(mmr_size);

  pos_s.push(pos);

  while (height > 0) {
    const peak = get_right_peak(height, pos, mmr_size);

    if (!peak) {
      break;
    }

    height = peak[0];
    pos = peak[1];
    pos_s.push(pos);
  }

  return pos_s;
}

function left_peak_height_pos(mmr_size: number): [number, number] {
  let height = 1;
  let prev_pos = 0;
  let pos = get_peak_pos_by_height(height);

  while (pos < mmr_size) {
    height += 1;
    prev_pos = pos;
    pos = get_peak_pos_by_height(height);
  }

  return [height - 1, prev_pos];
}

function get_right_peak(height: number, pos: number, mmr_size: number): [number, number] | null {
  // move to right sibling pos
  pos += sibling_offset(height);
  // loop until we find a pos in mmr
  while (pos > mmr_size - 1) {
    if (height === 0) {
      return null;
    }
    // move to left child
    pos -= parent_offset(height - 1);
    height -= 1;
  }

  return [height, pos];
}

function get_peak_pos_by_height(height: number): number {
  // eslint-disable-next-line no-bitwise
  return (1 << (height + 1)) - 2;
}

export function gen_proof_for_peak(leaf_pos: number, peak_pos: number): number[] {
  // do nothing if position itself is the peak
  if (leaf_pos === peak_pos) {
    return [];
  }

  const proof = [];
  const queue: [number, number][] = [];
  const calc_sibling = (pos: number, height: number) => {
    const next_height = pos_height_in_tree(pos + 1);
    const sib_pos = sibling_offset(height);

    if (next_height > height) {
      // implies pos is right sibling
      return [pos - sib_pos, pos + 1];
    } else {
      // pos is left sibling
      return [pos + sib_pos, pos + parent_offset(height)];
    }
  };

  // Generate sub-tree merkle proof for positions
  // eslint-disable-next-line no-constant-condition
  for (let [pos, height] = [leaf_pos, 0]; true; [pos, height] = queue.shift() ?? [NaN, NaN]) {
    if (pos === peak_pos || isNaN(pos)) {
      break;
    }

    const [sib_pos, parent_pos] = calc_sibling(pos, height);

    if (queue.length > 0 && sib_pos === queue[0][1]) {
      // drop sibling
      queue.shift();
    } else {
      proof.push(sib_pos);
    }

    if (parent_pos < peak_pos) {
      // save pos to tree buf
      queue.push([parent_pos, height + 1]);
    }
  }

  return proof;
}

export function bag_rhs_peaks(rhs_peaks: string[]): string {
  while (rhs_peaks.length > 1) {
    const right_peak = rhs_peaks.pop() as string;
    const left_peak = rhs_peaks.pop() as string;
    rhs_peaks.push(merge(right_peak, left_peak));
  }

  return rhs_peaks.pop() as string;
}

function parent_offset(height: number): number {
  return 2 << height;
}

function sibling_offset(height: number): number {
  return (2 << height) - 1;
}

/* ------------------------------------------inner fns------------------------------------------------- */

function dec2bin(dec: number): string {
  return (dec >>> 0).toString(2).padStart(64, '0');
}

function calcCount(dec: number, target: '0' | '1') {
  const binary = dec2bin(dec);
  let count = 0;

  for (let i = 0; i < binary.length; i++) {
    if (binary.charAt(i) === target) {
      count += 1;
    }
  }

  return count;
}

function trailing_zeros(dec: number): number {
  const binary = dec2bin(dec);
  let count = 0;

  for (let i = binary.length - 1; i >= 0; i--) {
    if (binary.charAt(i) === '0') {
      count += 1;
    } else {
      break;
    }
  }

  return count;
}

function leading_zeros(dec: number): number {
  const binary = dec2bin(dec);
  let count = 0;

  for (let i = 0; i < binary.length; i++) {
    if (binary.charAt(i) === '0') {
      count += 1;
    } else {
      break;
    }
  }

  return count;
}

function all_ones(dec: number): boolean {
  return dec !== 0 && calcCount(dec, '0') === leading_zeros(dec);
}

function jump_left(pos: number): number {
  const bit_length = 64 - leading_zeros(pos);
  const most_significant_bits = 1 << (bit_length - 1);

  return pos - (most_significant_bits - 1);
}
