import { Observable } from 'rxjs';
import { CrossToken, ParachainChainConfig, RequiredPartial, Tx } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { entrance } from 'shared/utils/connection';
import { convertToDvm, fromWei, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import abi from '../config/abi.json';
import { IssuingPayload } from '../model';

const patchAmount = (departure: CrossToken<ParachainChainConfig>) => {
  const pos = -3;
  const timestamp = Date.now().toString().slice(0, pos);
  return toWei(departure).slice(0, -timestamp.length) + timestamp;
};

export function issue(payload: IssuingPayload): Observable<Tx> {
  const {
    direction: { from: departure, to: arrival },
    sender,
    recipient,
  } = payload;
  const amount = patchAmount(departure);
  const api = entrance.polkadot.getInstance(departure.meta.provider);
  const palletInstance = 5;

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
          AccountKey20: {
            network: api.createType('NetworkId', 'Any'),
            key: recipient,
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

export function redeem(payload: IssuingPayload): Observable<Tx> {
  const {
    direction: { from: departure, to: arrival },
    sender,
    recipient,
  } = payload;
  const bridge = getBridge([departure.meta, arrival.meta]);
  const amount = patchAmount(departure);
  const destination = [1, ['0x0000000839', `0x01${convertToDvm(recipient).slice(2)}00`]];
  const weight = 4_000_000_000;

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) => contract.methods.transfer(departure.address, amount, destination, weight).send({ from: sender }),
    abi
  );
}

const genValidations = ({
  balance,
  amount,
}: RequiredPartial<TxValidation, 'balance' | 'amount'>): [boolean, string][] => {
  const decimals = +fromWei({ value: amount });

  return [
    [!Number.isInteger(decimals), TxValidationMessages.mustBeAnInteger],
    [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  ];
};

export const validate = validationObsFactory(genValidations);
