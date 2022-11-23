import { BN, BN_ZERO } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { ChainConfig, CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { signAndSendExtrinsic } from 'shared/utils/tx/polkadot';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, KhalaShidenBridgeConfig, RedeemPayload } from '../model';

export class KhalaShidenBridge extends Bridge<KhalaShidenBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'KhalaShidenBridge';
  private helixFlag = '204';

  private patchAmount(departure: CrossToken<ParachainChainConfig>) {
    const pos = -3;

    return toWei(departure).slice(0, pos) + this.helixFlag;
  }

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.patchAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const asset = api.createType('XcmV1MultiAsset', {
      id: api.createType('XcmV1MultiassetAssetId', {
        Concrete: api.createType('XcmV1MultiLocation', {
          parents: 1,
          interior: api.createType('XcmV1MultilocationJunctions', {
            X2: [
              api.createType('XcmV1Junction', {
                Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
              }),
              api.createType('XcmV1Junction', {
                GeneralKey: '0x0080', // TODO:
              }),
            ],
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
      direction: { from: departure },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.patchAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const message = api.createType('XcmVersionedXcm', {
      V2: [
        api.createType('XcmV2Instruction', {
          WithdrawAsset: [
            api.createType('XcmV1MultiAsset', {
              id: api.createType('XcmV1MultiassetAssetId', {
                Concrete: api.createType('XcmV1MultiLocation', {
                  parents: 0,
                  interior: api.createType('XcmV1MultilocationJunctions', 'Here'),
                }),
              }),
              fun: api.createType('XcmV1MultiassetFungibility', {
                Fungible: api.createType('Compact<u128>', amount),
              }),
            }),
          ],
        }),
        api.createType('XcmV2Instruction', {
          ClearOrigin: {}, // TODO
        }),
        api.createType('XcmV2Instruction', {
          BuyExecution: {
            fees: api.createType('XcmV1MultiAsset', {
              id: api.createType('XcmV1MultiassetAssetId', {
                Concrete: api.createType('XcmV1MultiLocation', {
                  parents: 0,
                  interior: api.createType('XcmV1MultilocationJunctions', 'Here'),
                }),
              }),
              fun: api.createType('XcmV1MultiassetFungibility', {
                Fungible: api.createType('Compact<u128>', '5000000000000'), // TODO
              }),
            }),
            weightLimit: api.createType('XcmV2WeightLimit', {
              Limited: api.createType('Compact<u64>', '4000000000'),
            }),
          },
        }),
        api.createType('XcmV2Instruction', {
          DepositAsset: {
            assets: api.createType('XcmV1MultiassetMultiAssetFilter', {
              Wild: api.createType('XcmV1MultiassetWildMultiAsset', 'All'),
            }),
            maxAssets: api.createType('Compact<u32>', 1),
            beneficiary: api.createType('XcmV1MultiLocation', {
              parents: 0,
              interior: api.createType('XcmV1MultilocationJunctions', {
                X1: api.createType('XcmV1Junction', {
                  AccountId32: {
                    network: api.createType('XcmV0JunctionNetworkId', 'Any'),
                    id: convertToDvm(recipient),
                  },
                }),
              }),
            }),
          },
        }),
      ],
    });

    const maxWeight = 0; // TODO
    const extrinsic = api.tx.polkadotXcm.execute(message, maxWeight);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    // TODO
    return { ...omit(direction.from, ['meta', 'amount']), amount: BN_ZERO };
  }
}
