import { BN, hexToBn } from '@polkadot/util';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import bridgeAbi from '../config/abi/bridge.json';
import { IssuingPayload, RedeemPayload } from '../model';

const prefix = hexToBn('0x6878000000000000');

export function transfer(value: IssuingPayload | RedeemPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: {
      from: { address: tokenAddress, amount, decimals, meta: fromChain },
      to,
    },
    maxSlippage,
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
      contract.methods
        .send(recipient, tokenAddress, transferAmount, dstChainId, nonce, maxSlippage)
        .send({ from: sender }),
    bridgeAbi as AbiItem[]
  );
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
