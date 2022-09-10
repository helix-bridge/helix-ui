import memoize from 'lodash/memoize';
import { entrance, waitUntilConnected } from '../connection';

const s2sMappingAddress: (rpc: string) => Promise<string> = async (rpc: string) => {
  const api = entrance.polkadot.getInstance(rpc);

  await waitUntilConnected(api);

  const section = rpc.includes('pangolin') ? api.query.substrate2SubstrateIssuing : api.query.fromDarwiniaIssuing;
  const mappingAddress = (await section.mappingFactoryAddress()).toString();

  return mappingAddress;
};

export const getS2SMappingAddress = memoize(s2sMappingAddress);
