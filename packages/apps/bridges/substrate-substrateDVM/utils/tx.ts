import { ApiPromise } from '@polkadot/api';
import { Codec } from '@polkadot/types/types';
import BN from 'bn.js';
import { last } from 'lodash';
import { from, map, Observable, switchMap } from 'rxjs';
import { abi } from 'shared/config/abi';
import { Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm, fromWei, toWei } from 'shared/utils/helper';
import { signAndSendExtrinsic, genEthereumContractTxObs } from 'shared/utils/tx';
import Web3 from 'web3';
import { IssuingPayload, RedeemPayload } from '../model';

export function issuing(value: IssuingPayload, api: ApiPromise, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
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
    switchMap(() => {
      const section = to.meta.isTest ? `${to.meta.name}FeeMarket` : 'feeMarket';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api.query as any)[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
        { id: string; collateral: number; fee: number }[]
      >;
    }),
    map((res) => {
      const num = fromWei({ value: last(res)?.fee.toString(), decimals: 9 });

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
