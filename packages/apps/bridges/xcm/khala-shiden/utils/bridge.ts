import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { signAndSendExtrinsic } from 'shared/utils/tx/polkadot';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, KhalaShidenBridgeConfig, RedeemPayload } from '../model';

export class KhalaShidenBridge extends Bridge<KhalaShidenBridgeConfig, ParachainChainConfig, ParachainChainConfig> {
  static readonly alias: string = 'KhalaShidenBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const asset = api.createType('XcmV1MultiAsset', {
      id: api.createType('XcmV1MultiassetAssetId', {
        Concrete: api.createType('XcmV1MultiLocation', {
          parents: 1,
          interior: api.createType('XcmV1MultilocationJunctions', {
            X1: api.createType('XcmV1Junction', {
              Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
            }),
          }),
        }),
      }),
      fun: api.createType('XcmV1MultiassetFungibility', {
        Fungible: api.createType('Compact<u128>', amount),
      }),
    });

    const dest = api.createType('XcmV1MultiLocation', {
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
    });

    const destWeight = 6e9;
    const extrinsic = api.tx.xTokens.transfer(asset, dest, destWeight);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  burn(payload: RedeemPayload, _fee: BN): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

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
              parents: 1,
              interior: api.createType('XcmV1MultilocationJunctions', {
                X1: api.createType('XcmV1Junction', {
                  Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
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

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);

    if (this.isIssue(from.host, to.host)) {
      const BASE_XCM_WEIGHT = 1e9;
      const INSTRUCTION_COUNT = 4;
      const BASE_WEIGHT_FEE = 1e9;

      return { ...token, amount: new BN(BASE_XCM_WEIGHT * INSTRUCTION_COUNT * BASE_WEIGHT_FEE) } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('3200000000000000000') } as TokenWithAmount;
    }
  }
}
