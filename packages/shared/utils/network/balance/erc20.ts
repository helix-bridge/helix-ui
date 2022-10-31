import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import type { BigNumber } from 'ethers';
import { Contract } from 'ethers';
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
    return BN_ZERO;
  }
}
