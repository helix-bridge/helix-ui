import { EMPTY, from, map, Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import bridgeAbi from '../config/abi/bridge.json';
import { IssuingPayload } from '../model';

export function issuing(value: IssuingPayload): Observable<Tx> {
  const {
    recipient,
    direction: {
      from: { address: tokenAddress, amount },
      to,
    },
    maxSlippage,
  } = value;
  const dstChainId = parseInt(to.meta.ethereumChain.chainId, 16);
  const nonce = Date.now();
  const transferAmount = toWei({ value: amount, decimals: to.decimals });

  console.log(
    '🚀 ~ file: tx.ts ~ line 14 ~ issuing ~ recipient',
    recipient,
    tokenAddress,
    transferAmount,
    maxSlippage,
    dstChainId,
    nonce
  );

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(bridgeAbi as AbiItem[], tokenAddress) as unknown as Contract;

  const promise = contract.methods.send(recipient, tokenAddress, transferAmount, dstChainId, nonce, maxSlippage);

  return from(promise).pipe(map((hash) => ({ status: 'finalized', hash } as Tx)));
}

export function redeem(): Observable<Tx> {
  return EMPTY;
}
