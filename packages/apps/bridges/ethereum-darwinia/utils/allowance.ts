import BN from 'bn.js';
import { abi } from 'shared/config/abi';
import { entrance } from 'shared/utils';
import Web3 from 'web3';

export async function getIssuingAllowance(
  account: string,
  ringContract: string,
  issuingContract: string
): Promise<BN | null> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.tokenABI, ringContract);

  try {
    const allowanceAmount = await contract.methods.allowance(account, issuingContract).call();

    return Web3.utils.toBN(allowanceAmount);
  } catch (error) {
    console.error('⚠ ~ file: allowance.ts getIssuingAllowance ~ error', error);
    return null;
  }
}
