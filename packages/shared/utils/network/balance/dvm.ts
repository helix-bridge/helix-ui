import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import Web3 from 'web3';
import { abi } from '../../../config/abi';
import { entrance } from '../../connection';

export async function getBalance(ktonAddress: string, account: string): Promise<[BN, BN]> {
  let ring = '0';
  let kton = '0';

  if (!Web3.utils.isAddress(account)) {
    return [BN_ZERO, BN_ZERO];
  }

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

  try {
    ring = await web3.eth.getBalance(account);
  } catch (error) {
    console.error(
      '%c [ get ring balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    const ktonContract = new web3.eth.Contract(abi.ktonABI, ktonAddress, { gas: 55000 });

    kton = await ktonContract.methods.balanceOf(account).call();
  } catch (error) {
    console.error(
      '%c [ get kton balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  return [new BN(ring), new BN(kton)];
}
