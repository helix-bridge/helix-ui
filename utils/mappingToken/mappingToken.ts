import Web3 from 'web3';
import { abi } from '../../config/abi';
import { RegisterStatus } from '../../config/constant';
import { EthereumChainConfig } from '../../model';
import { getAvailableDVMBridge } from '../bridge';
import { MMRProof } from '../mmr';
import { entrance } from '../network';

export interface Erc20RegisterProof {
  extrinsic_index: string;
  account_id: string;
  block_num: number;
  block_hash: string;
  backing: string;
  source: string;
  target: string;
  block_timestamp: number;
  mmr_index: number;
  mmr_root: string;
  signatures: string;
  block_header: string;
  tx: string;
}

export type StoredProof = {
  mmrProof: MMRProof;
  registerProof: Erc20RegisterProof;
  eventsProof: string;
};

/* --------------------------------------------Exported Section------------------------------------------------------- */

/**
 * @params {Address} address - erc20 token address
 */
export const getTokenRegisterStatus: (
  address: string,
  departure: EthereumChainConfig | string,
  provider?: string
) => Promise<RegisterStatus | null> =
  // eslint-disable-next-line complexity
  async (address, departure, provider) => {
    if (!address || !Web3.utils.isAddress(address)) {
      console.warn(`Token address is invalid, except an ERC20 token address. Received value: ${address}`);
      return null;
    }

    const contractAddress =
      typeof departure === 'string' ? departure : getAvailableDVMBridge(departure).config.contracts.redeem;
    const web3 = entrance.web3.getInstance(provider || entrance.web3.defaultProvider);
    const contract = new web3.eth.Contract(abi.bankErc20ABI, contractAddress);
    const { target, timestamp } = await contract.methods.assets(address).call();
    const isTimestampExist = +timestamp > 0;
    let isTargetTruthy = false;

    try {
      // if target exists, the number should be overflow.
      isTargetTruthy = !!Web3.utils.hexToNumber(target);
    } catch (_) {
      isTargetTruthy = true;
    }

    if (isTimestampExist && !isTargetTruthy) {
      return RegisterStatus.registering;
    }

    if (isTimestampExist && isTargetTruthy) {
      return RegisterStatus.registered;
    }

    return RegisterStatus.unregister;
  };

/**
 *
 * @param tokenAddress - token contract address
 * @param account - current active metamask account
 * @returns balance of the account
 */
export async function getErc20TokenBalance(address: string, account: string, isErc20Native = true) {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const tokenAbi = isErc20Native ? abi.Erc20ABI : abi.tokenABI;
  const contract = new web3.eth.Contract(tokenAbi, address);

  try {
    const balance = await contract.methods.balanceOf(account).call();

    return Web3.utils.toBN(balance);
  } catch (err) {
    console.info(
      `%c [ get token(${address}) balance error. account: ${account} ]-52`,
      'font-size:13px; background:pink; color:#bf2c9f;',
      (err as Record<string, string>).message
    );
  }

  return Web3.utils.toBN(0);
}
