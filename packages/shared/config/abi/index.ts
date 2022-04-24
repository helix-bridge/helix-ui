import { AbiItem } from 'web3-utils';
import bankABI from './bankABI.json';
import bankErc20ABI from './bankErc20.json';
import bankErc20HelperABI from './bankErc20Helper.json';
import ktonABI from './ktonABI.json';
import tokenABI from './tokenABI.json';
import registryABI from './registryABI.json';
import tokenIssuingABI from './tokenIssuingABI.json';
import Erc20Byte32ABI from './Erc20-bytes32.json';
import Erc20StringABI from './Erc20-string.json';
import Erc20ABI from './Erc20.json';
import Erc20MappingTokenABI from './Erc20MappingToken.json';
import S2SMappingTokenABI from './S2SMappingToken.json';
import relayABI from './relay.json';

type keys =
  | 'ktonABI'
  | 'tokenABI'
  | 'registryABI'
  | 'bankABI'
  | 'tokenIssuingABI'
  | 'bankErc20ABI'
  | 'Erc20ABI'
  | 'Erc20StringABI'
  | 'Erc20Byte32ABI'
  | 'Erc20MappingTokenABI'
  | 'S2SMappingTokenABI'
  | 'relayABI';

export const abi = {
  bankABI,
  bankErc20ABI,
  bankErc20HelperABI,
  Erc20ABI,
  Erc20Byte32ABI,
  Erc20StringABI,
  ktonABI,
  Erc20MappingTokenABI,
  registryABI,
  relayABI,
  S2SMappingTokenABI,
  tokenABI,
  tokenIssuingABI,
} as {
  [key in keys]: AbiItem[];
};
