import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { from, map, Observable, switchMap } from 'rxjs';
import { abi } from 'shared/config/abi';
import { Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm, fromWei, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import Web3 from 'web3';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';
import { getFee } from './fee';

export function issuing(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '4000000000';
  const module = departure.meta.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
  const extrinsic = api.tx[module].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function redeem(value: RedeemPayload, mappingAddress: string, specVersion: string): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from: departure, to },
  } = value;
  const receiver = Web3.utils.hexToBytes(convertToDvm(recipient));
  const WEIGHT = '690133000';
  const api = entrance.polkadot.getInstance(departure.meta.provider);

  const valObs = from(waitUntilConnected(api)).pipe(
    switchMap(() => getFee(departure.meta, to.meta)),
    map((res) => {
      const num = fromWei({ value: res, decimals: 9 });

      return Web3.utils.toHex(toWei({ value: num }));
    })
  );

  return valObs.pipe(
    switchMap((val) =>
      genEthereumContractTxObs(
        mappingAddress,
        (contract) =>
          contract.methods
            .burnAndRemoteUnlockWaitingConfirm(
              specVersion,
              WEIGHT,
              departure.address,
              receiver,
              toWei({ value: departure.amount, decimals: departure.decimals })
            )
            .send({ from: sender, value: val }),
        abi.S2SMappingTokenABI
      )
    )
  );
}

export const genValidations = ({ balance, amount, dailyLimit, allowance, fee }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!dailyLimit && dailyLimit.lt(amount), TxValidationMessages.dailyLimitLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);
