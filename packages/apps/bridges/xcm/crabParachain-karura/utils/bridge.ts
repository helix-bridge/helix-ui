import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import { crabParachainConfig, karuraConfig } from 'shared/config/network';
import { BridgeBase, CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { Bridge } from '../../../../model/bridge';
import { crabParachainKaruraConfig } from '../config';
import { CrabParachainKaruraBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class CrabParachainKaruraBridge extends Bridge<
  CrabParachainKaruraBridgeConfig,
  ParachainChainConfig,
  ParachainChainConfig
> {
  private patchAmount(departure: CrossToken<ParachainChainConfig>) {
    const pos = -3;
    const timestamp = Date.now().toString().slice(0, pos);
    return toWei(departure).slice(0, -timestamp.length) + timestamp;
  }

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    const amount = this.patchAmount(departure);
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

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    const amount = this.patchAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider);

    const currencyId = api.createType('AcalaPrimitivesCurrencyCurrencyId', {
      ForeignAsset: 13,
    });

    const dest = api.createType('XcmVersionedMultiLocation', {
      V1: api.createType('XcmV1MultiLocation', {
        parents: 1,
        interior: api.createType('XcmV1MultilocationJunctions', {
          X2: [
            api.createType('XcmV1Junction', {
              Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
            }),
            api.createType('XcmV1Junction', {
              AccountId32: {
                network: api.createType('XcmV0JunctionNetworkId', 'Any'),
                id: convertToDvm(recipient),
              },
            }),
          ],
        }),
      }),
    });

    const destWeight = 5_000_000_000;
    const extrinsic = api.tx.xTokens.transfer(currencyId, amount, dest, destWeight);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  genTxParamsValidations({ balance, amount }: TxValidation): [boolean, string][] {
    const decimals = +fromWei({ value: amount });

    return [
      [!Number.isInteger(decimals), TxValidationMessages.mustBeAnInteger],
      [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
    ];
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<BN> {
    const { from, to } = direction;

    if (this.isIssue(from.host, to.host)) {
      return new BN('92696000000000000');
    } else {
      return new BN('3200000000000000000');
    }
  }
}
export const crabParachainKarura = new BridgeBase(crabParachainConfig, karuraConfig, crabParachainKaruraConfig, {
  name: 'crabParachain-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
