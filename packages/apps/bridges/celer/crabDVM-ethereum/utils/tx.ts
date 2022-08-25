import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { AbiItem } from 'web3-utils';
import { IssuingPayload, RedeemPayload } from '../../cBridge/model';
import { burn, prefix } from '../../cBridge/utils';
import abi from '../config/deposit.json';

export const issuing = burn;

export function redeem(value: IssuingPayload | RedeemPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: {
      from: { address: tokenAddress, amount, decimals, meta: fromChain },
      to,
    },
    bridge,
  } = value;
  const dstChainId = parseInt(to.meta.ethereumChain.chainId, 16);
  const nonce = new BN(Date.now()).add(prefix).toString();
  const transferAmount = toWei({ value: amount, decimals });
  const { contracts } = bridge.config;
  const contractAddress = bridge.isIssuing(fromChain, to.meta) ? contracts.issuing : contracts.redeem;

  return genEthereumContractTxObs(
    contractAddress,
    (contract) =>
      contract.methods.deposit(tokenAddress, transferAmount, dstChainId, recipient, nonce).send({ from: sender }),
    abi as AbiItem[]
  );
}
