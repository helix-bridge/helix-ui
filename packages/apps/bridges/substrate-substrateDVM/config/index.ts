import { AbiItem } from 'web3-utils';
import * as backingAbi from './s2sv2backing.json';
import * as burnAbi from './s2sv2burn.json';

export const abi = { backingAbi, burnAbi } as { [key: string]: AbiItem[] };
