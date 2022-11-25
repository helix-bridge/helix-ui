import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenKhalaBridgeConfig } from '../model';

export class ShidenKhalaBridge extends Bridge<ShidenKhalaBridgeConfig, ParachainChainConfig, ParachainChainConfig> {
  static readonly alias: string = 'ShidenKhalaBridge';

  private transfer(payload: IssuingPayload | RedeemPayload): Observable<Tx> {
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
              parents: this.isIssue(departure.host, arrival.host) ? 1 : 0,
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

  back(payload: IssuingPayload): Observable<Tx> {
    return this.transfer(payload);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    return this.transfer(payload);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);
    const api = entrance.polkadot.getInstance(to.meta.provider.wss);
    const INSTRUCTION_COUNT = new BN('4');
    const WEIGHT_PER_SECOND = new BN('1000000000000');

    await waitUntilConnected(api);

    if (this.isIssue(from.host, to.host)) {
      const unitWeightCost = new BN('200000000');
      const unitWeightPerSecond = await api.query.assetsRegistry.registryInfoByIds(to.address).then((res) => {
        const data = res.toHuman() as { executionPrice: string };
        const amount = data.executionPrice.replace(/,/g, '');

        return new BN(amount);
      });

      return {
        ...token,
        amount: unitWeightCost.mul(INSTRUCTION_COUNT).mul(unitWeightPerSecond).div(WEIGHT_PER_SECOND),
      } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('4635101624603116') } as TokenWithAmount;
    }
  }
}
