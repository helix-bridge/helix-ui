import { entrance } from './entrance';

/**
 *
 * @params network id
 * @description is actual network id match with expected.
 */
export async function isNetworkMatch(expectNetworkId: number): Promise<boolean> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const networkId = await web3.eth.net.getId();

  return expectNetworkId === networkId;
}
