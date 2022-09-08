import { BN_ZERO, hexToU8a, stringToHex, BN } from '@polkadot/util';
import type { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { abi } from 'shared/config/abi';
import { Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm, fromWei, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';
import { getFee } from './fee';

export function issue(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '4000000000';
  const section = departure.meta.isTest ? 'substrate2SubstrateBacking' : 'toCrabBacking';
  const extrinsic = api.tx[section].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function redeem(value: RedeemPayload, mappingAddress: string, specVersion: string): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from: departure, to },
  } = value;
  const receiver = hexToU8a(convertToDvm(recipient));
  const WEIGHT = '690133000';
  const api = entrance.polkadot.getInstance(departure.meta.provider);

  const valObs = from(waitUntilConnected(api)).pipe(
    switchMap(() => getFee(departure.meta, to.meta)),
    map((res) => {
      const num = fromWei({ value: res, decimals: 9 });

      return stringToHex(toWei({ value: num }));
    })
  );

  return valObs.pipe(
    switchMap((val) =>
      genEthereumContractTxObs(
        mappingAddress,
        (contract) =>
          contract.methods.burnAndRemoteUnlockWaitingConfirm(
            specVersion,
            WEIGHT,
            departure.address,
            receiver,
            toWei({ value: departure.amount, decimals: departure.decimals }),
            { from: sender, value: val }
          ),
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
