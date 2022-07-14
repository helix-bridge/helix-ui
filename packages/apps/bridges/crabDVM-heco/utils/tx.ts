import { BN_ZERO } from '@polkadot/util';
import { EMPTY, Observable } from 'rxjs';
import { Tx } from 'shared/model';
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

export const genValidations = ({ balance, amount, allowance, fee }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);
