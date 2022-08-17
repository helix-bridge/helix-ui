import { Observable } from 'rxjs';
import { RequiredPartial, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm, toWei } from 'shared/utils/helper';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { IssuingPayload } from '../model';

export function issuing(payload: IssuingPayload, palletInstance: number): Observable<Tx> {
  const {
    direction: { from: departure, to: arrival },
    sender,
    recipient,
  } = payload;
  const timestamp = Date.now().toString();
  const amount = toWei(departure).slice(0, -timestamp.length) + timestamp;
  const api = entrance.polkadot.getInstance(departure.meta.provider);

  const dest = api.createType('XcmVersionedMultiLocation', {
    V1: api.createType('XcmV1MultiLocation', {
      parents: 1,
      interior: api.createType('XcmV1MultilocationJunctions', {
        X1: api.createType('XcmV1Junction', {
          Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
        }),
      }),
    }),
  });

  const beneficiary = api.createType('XcmVersionedMultiLocation', {
    V1: api.createType('XcmV1MultiLocation', {
      parents: 0,
      interior: api.createType('XcmV1MultilocationJunctions', {
        X1: api.createType('XcmV1Junction', {
          AccountId32: {
            network: api.createType('NetworkId', 'Any'),
            id: convertToDvm(recipient),
          },
        }),
      }),
    }),
  });

  const assets = api.createType('XcmVersionedMultiAssets', {
    V1: [
      api.createType('XcmV1MultiAsset', {
        id: api.createType('XcmV1MultiassetAssetId', {
          Concrete: api.createType('XcmV1MultiLocation', {
            parents: 0,
            interior: api.createType('XcmV1MultilocationJunctions', {
              X1: api.createType('XcmV1Junction', {
                PalletInstance: palletInstance,
              }),
            }),
          }),
        }),
        fun: api.createType('XcmV1MultiassetFungibility', {
          Fungible: api.createType('Compact<u128>', amount),
        }),
      }),
    ],
  });

  const feeAssetItem = 0;
  const extrinsic = api.tx.polkadotXcm.reserveTransferAssets(dest, beneficiary, assets, feeAssetItem);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export const redeem = issuing;

const genValidations = ({
  balance,
  amount,
}: RequiredPartial<TxValidation, 'balance' | 'amount'>): [boolean, string][] => [
  [amount.toString().includes('.'), TxValidationMessages.mustBeAnInteger],
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);
