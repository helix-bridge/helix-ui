import { BN, hexToBn } from '@polkadot/util';
import { base64, getAddress, hexlify } from 'ethers/lib/utils';
import { last } from 'lodash';
import { EMPTY, from, Observable, switchMap } from 'rxjs';
import { HelixHistoryRecord, Tx } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import transferAbi from '../config/abi/bridge.json';
import burnAbi from '../config/abi/burn.json';
import depositAbi from '../config/abi/deposit.json';
import { IssuingPayload, RedeemPayload } from '../model';
import { WebClient } from '../ts-proto/gateway/GatewayServiceClientPb';
import { GetTransferStatusRequest, WithdrawLiquidityRequest, WithdrawMethodType } from '../ts-proto/gateway/gateway_pb';
import { WithdrawReq, WithdrawType } from '../ts-proto/sgn/cbridge/v1/tx_pb';

export const prefix = hexToBn('0x6878000000000000');
export const client = new WebClient(`https://cbridge-prod2.celer.network`, null, null);

/**
 * astar, crab-dvm send USDC, USDT method
 * */
export function burn(value: IssuingPayload | RedeemPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: {
      from: { address: tokenAddress, amount, decimals, meta: fromChain },
      to,
    },
    bridge,
  } = value;
  const nonce = new BN(Date.now()).add(prefix).toString();
  const transferAmount = toWei({ value: amount, decimals });
  const { contracts } = bridge.config;
  const contractAddress = bridge.isIssuing(fromChain, to.meta)
    ? contracts.stablecoinIssuing
    : contracts.stablecoinRedeem;

  if (!contractAddress) {
    console.warn(
      `🚨 Transfer from ${value.direction.from.symbol} on ${fromChain.name} to ${value.direction.to.symbol} on ${to.host} terminated because of ${contractAddress} is an invalid contract address`
    );
    return EMPTY;
  }

  return genEthereumContractTxObs(
    contractAddress,
    (contract) => contract.methods.burn(tokenAddress, transferAmount, recipient, nonce).send({ from: sender }),
    burnAbi as AbiItem[]
  );
}

export function deposit(value: IssuingPayload | RedeemPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: {
      from: { address: tokenAddress, amount, decimals, meta: fromChain },
      to,
    },
    bridge,
  } = value;
  const mintChainId = parseInt(to.meta.ethereumChain.chainId, 16);
  const nonce = new BN(Date.now()).add(prefix).toString();
  const transferAmount = toWei({ value: amount, decimals });
  const { contracts } = bridge.config;
  const contractAddress = bridge.isIssuing(fromChain, to.meta)
    ? contracts.stablecoinIssuing
    : contracts.stablecoinRedeem;

  if (!contractAddress) {
    console.warn(
      `🚨 Transfer from ${value.direction.from.symbol} on ${fromChain.name} to ${value.direction.to.symbol} on ${to.host} terminated because of ${contractAddress} is an invalid contract address`
    );
    return EMPTY;
  }

  return genEthereumContractTxObs(
    contractAddress,
    (contract) =>
      contract.methods.deposit(tokenAddress, transferAmount, mintChainId, recipient, nonce).send({ from: sender }),
    depositAbi as AbiItem[]
  );
}

/**
 * common transfer method
 */
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
    transferAbi as AbiItem[]
  );
}

export function withdraw(record: HelixHistoryRecord): Observable<Tx> {
  const request = new GetTransferStatusRequest();
  const { id, fromChain, toChain, sender } = record;
  const transferId = last(id.split('-')) as string;
  const bridge = getBridge([fromChain, toChain]);
  const { contracts } = bridge.config;
  const contractAddress = bridge.isIssuing(fromChain, toChain) ? contracts?.issuing : contracts?.redeem;

  request.setTransferId(transferId);

  return from(client.getTransferStatus(request, null)).pipe(
    switchMap((response) => {
      const { sortedSigsList, signersList, powersList, wdOnchain } = response.toObject();
      const wd = hexlify(base64.decode(wdOnchain as string));
      const sigs = sortedSigsList.map((item) => hexlify(base64.decode(item as string)));

      const signers = signersList.map((item) => {
        const decodeSigners = base64.decode(item as string);
        const hexlifyObj = hexlify(decodeSigners);

        return getAddress(hexlifyObj);
      });

      const powers = powersList.map((item) => {
        const ary = base64.decode(item as string);

        return hexlify(ary);
      });

      return genEthereumContractTxObs(
        contractAddress as string,
        (contract) => contract.methods.withdraw(wd, sigs, signers, powers).send({ from: sender }),
        transferAbi as AbiItem[]
      );
    })
  );
}

export async function requestRefund(record: HelixHistoryRecord) {
  const timestamp = Math.floor(Date.now() / 1000);
  const withdrawReq = new WithdrawReq();
  const { id } = record;
  const transferId = last(id.split('-')) as string;

  withdrawReq.setReqId(timestamp);
  withdrawReq.setXferId(transferId);
  withdrawReq.setWithdrawType(WithdrawType.WITHDRAW_TYPE_REFUND_TRANSFER);

  const request = new WithdrawLiquidityRequest();

  request.setWithdrawReq(withdrawReq.serializeBinary());
  request.setMethodType(WithdrawMethodType.WD_METHOD_TYPE_ONE_RM);

  const response = await client.withdrawLiquidity(request, null);

  return response;
}

export const genValidations = ({ balance, amount, allowance }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);

export const getMinimalMaxSlippage = async (contractAddress: string) => {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(transferAbi as AbiItem[], contractAddress) as unknown as Contract;
  const result = await contract.methods.minimalMaxSlippage().call();

  return result;
};
