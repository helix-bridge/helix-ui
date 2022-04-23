import { memoize } from 'lodash';
import { entrance, waitUntilConnected } from '../network';

const s2sMappingAddress: (rpc: string) => Promise<string> = async (rpc: string) => {
  const api = entrance.polkadot.getInstance(rpc);

  await waitUntilConnected(api);

  const module = rpc.includes('pangolin') ? api.query.substrate2SubstrateIssuing : api.query.fromDarwiniaIssuing;
  const mappingAddress = (await module.mappingFactoryAddress()).toString();

  return mappingAddress;
};

export const getS2SMappingAddress = memoize(s2sMappingAddress);

export const getErc20MappingAddress: (rpc: string) => Promise<string> = (_: string) => {
  return Promise.resolve('0xcB8531Bc0B7C8F41B55CF4E94698C37b130597B9');
};
