import BN from 'bn.js';
import { Contract } from 'ethers';
import { abi } from '../../../config/abi';

export async function getBalance(tokenAddress: string, account: string): Promise<BN> {
  try {
    const contract = new Contract(tokenAddress, abi.tokenABI);
    const balance = await contract.methods.balanceOf(account).call();

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
