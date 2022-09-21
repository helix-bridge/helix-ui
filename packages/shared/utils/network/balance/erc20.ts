import BN from 'bn.js';
import { Contract } from 'ethers';
import type { BigNumber } from 'ethers';
import { abi } from '../../../config/abi';
import { entrance } from '../../connection';

export async function getBalance(tokenAddress: string, account: string, provider?: string): Promise<BN> {
  try {
    const contract = new Contract(
      tokenAddress,
      abi.tokenABI,
      provider ? entrance.web3.getInstance(provider) : entrance.web3.currentProvider
    );
    const balance = await contract.balanceOf(account).then((res: BigNumber) => res.toString());

    return new BN(balance);
  } catch (err) {
    console.info(
      `%c [ get token(${tokenAddress}) balance error. account: ${account} ]-52`,
      'font-size:13px; background:pink; color:#bf2c9f;',
      (err as Record<string, string>).message
    );
  }

  return new BN(0);
}
