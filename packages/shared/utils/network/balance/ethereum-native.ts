import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { isAddress } from 'ethers/lib/utils';
import { entrance } from '../../connection';

export async function getBalance(account: string, provider: string): Promise<BN> {
  if (!isAddress(account)) {
    return BN_ZERO;
  }

  const pro = entrance.web3.getInstance(provider);

  try {
    const result = await pro.getBalance(account).then((res) => res.toString());

    return new BN(result);
  } catch (error) {
    return BN_ZERO;
  }
}
