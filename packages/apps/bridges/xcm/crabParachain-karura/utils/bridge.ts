import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { CrabParachainKaruraBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class CrabParachainKaruraBridge extends Bridge<
  CrabParachainKaruraBridgeConfig,
  ParachainChainConfig,
  ParachainChainConfig
> {
  static readonly alias = 'CrabParachainKaruraBridge';

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
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);
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
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

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

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount> {
    const { from, to } = direction;
    const token = omit(direction.from.meta.tokens.find((item) => isRing(item.symbol))!, ['amount', 'meta']);

    if (this.isIssue(from.host, to.host)) {
      return { ...token, amount: new BN('92696000000000000') } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('3200000000000000000') } as TokenWithAmount;
    }
  }
}
