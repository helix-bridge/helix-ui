import BN from 'bn.js';
import Web3 from 'web3';
import { abi } from '../../../config/abi';
import { entrance } from '../../connection';

export async function getBalance(tokenAddress: string, account: string): Promise<BN> {
  try {
    const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
    const contract = new web3.eth.Contract(abi.tokenABI, tokenAddress);
    const balance = await contract.methods.balanceOf(account).call();

    return Web3.utils.toBN(balance);
  } catch (err) {
    console.info(
      `%c [ get token(${tokenAddress}) balance error. account: ${account} ]-52`,
      'font-size:13px; background:pink; color:#bf2c9f;',
      (err as Record<string, string>).message
    );
  }

  return Web3.utils.toBN(0);
}
