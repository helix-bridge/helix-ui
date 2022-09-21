import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { Contract } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { abi } from '../../../config/abi';
import { entrance } from '../../connection';

export async function getBalance(account: string, provider: string, ktonAddress?: string): Promise<[BN, BN]> {
  let ring = '0';
  let kton = '0';

  if (!isAddress(account)) {
    return [BN_ZERO, BN_ZERO];
  }

  const pro = entrance.web3.getInstance(provider);

  try {
    ring = await pro.getBalance(account).then((res) => res.toString());
  } catch (error) {
    console.error(
      '%c [ get ring balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    if (ktonAddress) {
      const contract = new Contract(ktonAddress, abi.ktonABI, pro);

      kton = await contract.balanceOf(account);
    }
  } catch (error) {
    console.error(
      '%c [ get kton balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  return [new BN(ring.toString()), new BN(kton.toString())];
}
