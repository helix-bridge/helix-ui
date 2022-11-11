import { TransactionReceipt, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import BN from 'bn.js';
import type { BigNumber } from 'ethers';
import { Contract } from 'ethers';
import type { Deferrable } from 'ethers/lib/utils';
import omitBy from 'lodash/omitBy';
import { Observable } from 'rxjs/internal/Observable';
import { abi } from '../../config/abi';
import { Tx } from '../../model';
import { entrance } from '../connection';
import { toWei } from '../helper/balance';

type TxFn<T> = (value: T) => Observable<Tx>;

export async function getAllowance(
  sender: string,
  spender: string,
  tokenAddress: string,
  provider: string
): Promise<BN | null> {
  const contract = new Contract(tokenAddress, abi.tokenABI, entrance.web3.getInstance(provider));

  try {
    const allowanceAmount = await contract.allowance(sender, spender).then((res: BigNumber) => res.toString());

    return new BN(allowanceAmount);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return null;
  }
}

export const approveToken: TxFn<{
  sender: string;
  tokenAddress?: string;
  spender?: string;
  sendOptions?: { gas?: string; gasPrice?: string };
}> = ({ sender, tokenAddress, spender, sendOptions }) => {
  if (!tokenAddress) {
    throw new Error(`Can not approve the token with address ${tokenAddress}`);
  }

  if (!spender) {
    throw new Error(`No spender account set`);
  }

  const hardCodeAmount = '100000000000000000000000000';
  const params = sendOptions ? { from: sender, ...omitBy(sendOptions, (value) => !value) } : { from: sender };

  return sendTransactionFromContract(tokenAddress, (contract) =>
    contract.approve(spender, toWei({ value: hardCodeAmount }), params)
  );
};

/**
 * @param contractAddress - Contract address in ethereum
 * @param fn - Contract method to be call, will receive the contract instance as the incoming parameter;
 * @param contractAbi - Contract ABI
 * @returns An Observable which will emit the tx events that includes signing, queued, finalized and error.
 */
export function sendTransactionFromContract(
  contractAddress: string,
  fn: (contract: Contract) => Promise<TransactionResponse>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contractAbi: any = abi.tokenABI
): Observable<Tx> {
  return new Observable((observer) => {
    try {
      const signer = entrance.web3.currentProvider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      observer.next({ status: 'signing' });

      fn(contract)
        .then((tx: TransactionResponse) => {
          observer.next({ status: 'queued', hash: tx.hash });

          return tx.wait();
        })
        .then((receipt: TransactionReceipt) => {
          observer.next({ status: 'finalized', hash: receipt.transactionHash });
          observer.complete();
        })
        .catch((error: { code: number; message: string; data?: { data: string; message: string } }) => {
          observer.error({ status: 'error', error: error.message + '\n' + error.data?.message ?? '' });
        });
    } catch (error) {
      observer.error({ status: 'error', error: 'Contract construction/call failed!' });
    }
  });
}

export function sendTransaction(params: Deferrable<TransactionRequest>): Observable<Tx> {
  const provider = entrance.web3.currentProvider;
  const signer = provider.getSigner();

  return new Observable((observer) => {
    signer.sendTransaction(params).then((res) => {
      observer.next({ status: 'finalized', hash: res.hash });
      observer.complete();
    });

    provider
      .on('transactionHash', (hash) => {
        observer.next({ status: 'queued', hash });
      })
      .on('error', (error) => {
        observer.error({ status: 'error', error: error.message });
      });
  });
}
