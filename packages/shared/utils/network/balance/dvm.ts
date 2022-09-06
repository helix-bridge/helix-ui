import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { Contract } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { abi } from '../../../config/abi';
import { entrance } from '../../connection';

export async function getBalance(account: string, ktonAddress?: string): Promise<[BN, BN]> {
  let ring = '0';
  let kton = '0';

  if (!isAddress(account)) {
    return [BN_ZERO, BN_ZERO];
  }

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

  try {
    ring = await web3.getBalance(account).then((res) => res.toString());
  } catch (error) {
    console.error(
      '%c [ get ring balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    if (ktonAddress) {
      const ktonContract = new Contract(ktonAddress, abi.ktonABI);

      kton = await ktonContract.balanceOf(account).call();
    }
  } catch (error) {
    console.error(
      '%c [ get kton balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  return [new BN(ring), new BN(kton)];
}
