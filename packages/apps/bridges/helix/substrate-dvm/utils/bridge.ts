import { BN, u8aToHex } from '@polkadot/util';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from as rxFrom } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { DVMChainConfig, PolkadotChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToSS58, dvmAddressToAccountId } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { typeRegistryFactory } from 'shared/utils/helper/huge';
import { isRing } from 'shared/utils/helper/validator';
import { genEthereumTransactionObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, SubstrateDVMBridgeConfig } from '../model';

export class SubstrateDVMBridge extends Bridge<SubstrateDVMBridgeConfig, PolkadotChainConfig, DVMChainConfig> {
  static readonly alias: string = 'SubstrateDVMBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      sender,
      recipient,
      direction: { from },
    } = payload;
    const toAccount = dvmAddressToAccountId(recipient).toHuman();
    const amount = toWei(from);
    const api = entrance.polkadot.getInstance(from.meta.provider);
    const extrinsic = isRing(from.symbol)
      ? api.tx.balances.transfer(toAccount, new BN(amount))
      : api.tx.kton.transfer(toAccount, new BN(amount));

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      recipient,
      sender,
      direction: { from, to },
    } = payload;

    return rxFrom(typeRegistryFactory()).pipe(
      mergeMap((TypeRegistry) => {
        const registry = new TypeRegistry();
        const accountId = registry.createType('AccountId', convertToSS58(recipient, to.meta.ss58Prefix)).toHex();

        if (accountId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
          return EMPTY;
        }

        const web3 = entrance.web3.currentProvider;
        const api = entrance.polkadot.getInstance(from.meta.provider);

        return rxFrom(waitUntilConnected(api)).pipe(
          mergeMap(async () => {
            const amount = toWei({ value: from.amount, decimals: 9 });
            const transfer = isRing(from.symbol) ? api.tx.balances.transfer : api.tx.kton.transfer;

            return transfer(recipient, amount);
          }),
          switchMap((extrinsic) =>
            rxFrom(
              web3.estimateGas({
                from: sender,
                to: SUBSTRATE_DVM_WITHDRAW,
                data: u8aToHex(extrinsic.method.toU8a()),
              })
            ).pipe(
              switchMap((gas) =>
                genEthereumTransactionObs({
                  from: sender,
                  to: SUBSTRATE_DVM_WITHDRAW,
                  data: u8aToHex(extrinsic.method.toU8a()),
                  gasLimit: gas.toString(),
                })
              )
            )
          )
        );
      })
    );
  }
}
