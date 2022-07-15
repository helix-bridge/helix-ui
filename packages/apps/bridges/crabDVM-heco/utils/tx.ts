import { EMPTY, Observable } from 'rxjs';
import { Contract } from 'web3-eth-contract';
import { Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import bridgeAbi from '../config/abi/bridge.json';
import { IssuingPayload } from '../model';

export function issuing(value: IssuingPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: {
      from: { address: tokenAddress, amount, decimals },
      to,
    },
    maxSlippage,
    bridge,
  } = value;
  const dstChainId = parseInt(to.meta.ethereumChain.chainId, 16);
  const nonce = Date.now();
  const transferAmount = toWei({ value: amount, decimals });

  return genEthereumContractTxObs(
    bridge.config.contracts.issuing,
    (contract) =>
      contract.methods
        .send(recipient, tokenAddress, transferAmount, dstChainId, nonce, maxSlippage)
        .send({ from: sender }),
    bridgeAbi as AbiItem[]
  );
}

export function redeem(): Observable<Tx> {
  return EMPTY;
}

export const genValidations = ({ balance, amount, allowance }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);

export const getMinimalMaxSlippage = async (contractAddress: string) => {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(bridgeAbi as AbiItem[], contractAddress) as unknown as Contract;
  const result = await contract.methods.minimalMaxSlippage().call();

  return result;
};
