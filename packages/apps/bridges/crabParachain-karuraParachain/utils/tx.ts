import { TypeRegistry } from '@polkadot/types';
import { EMPTY, Observable } from 'rxjs';
import { RequiredPartial, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm, toWei } from 'shared/utils/helper';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';

export function issuing(payload: IssuingPayload, palletInstance: number): Observable<Tx> {
  const {
    direction: { from: departure, to: arrival },
    sender,
    recipient,
  } = payload;
  const timestamp = Date.now().toString();
  const amount = toWei(departure).slice(0, -timestamp.length) + timestamp;
  const registry = new TypeRegistry();
  const api = entrance.polkadot.getInstance(departure.meta.provider);

  const dest = registry.createType('XcmVersionedMultiLocation', {
    V1: registry.createType('XcmV1MultiLocation', {
      parents: 1,
      interior: registry.createType('XcmV1MultilocationJunctions', {
        X1: registry.createType('XcmV1Junction', {
          Parachain: registry.createType('Compact<u32>', arrival.meta.paraId),
        }),
      }),
    }),
  });

  const beneficiary = registry.createType('XcmVersionedMultiLocation', {
    V1: registry.createType('XcmV1MultiLocation', {
      parents: 0,
      interior: registry.createType('XcmV1MultilocationJunctions', {
        X1: registry.createType('XcmV1Junction', {
          AccountId32: {
            network: registry.createType('NetworkId', 'Any'),
            id: convertToDvm(recipient),
          },
        }),
      }),
    }),
  });

  const assets = registry.createType('XcmVersionedMultiAssets', {
    V1: [
      registry.createType('XcmV1MultiAsset', {
        id: registry.createType('XcmV1MultiassetAssetId', {
          Concrete: registry.createType('XcmV1MultiLocation', {
            parents: 0,
            interior: registry.createType('XcmV1MultilocationJunctions', {
              X1: registry.createType('XcmV1Junction', {
                PalletInstance: palletInstance,
              }),
            }),
          }),
        }),
        fun: registry.createType('XcmV1MultiassetFungibility', {
          Fungible: registry.createType('Compact<u128>', amount),
        }),
      }),
    ],
  });

  const feeAssetItem = 0;
  const extrinsic = api.tx.polkadotXcm.reserveTransferAssets(dest, beneficiary, assets, feeAssetItem);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function redeem(payload: RedeemPayload): Observable<Tx> {
  console.log('🚀 ~ file: tx.ts ~ line 14 ~ redeem ~ payload', payload);
  return EMPTY;
}

const genValidations = ({
  balance,
  amount,
}: RequiredPartial<TxValidation, 'balance' | 'amount'>): [boolean, string][] => [
  [amount.toString().includes('.'), TxValidationMessages.mustBeAnInteger],
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);
