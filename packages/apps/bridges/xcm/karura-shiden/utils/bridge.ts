import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, KaruraShidenBridgeConfig, RedeemPayload } from '../model';

export class KaruraShidenBridge extends Bridge<KaruraShidenBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'KaruraShidenBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const currencyId = api.createType('AcalaPrimitivesCurrencyCurrencyId', {
      Token: departure.symbol,
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

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);

    if (this.isIssue(from.host, to.host)) {
      return {
        ...token,
        amount: new BN('3880000000'),
      } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('9269600000') } as TokenWithAmount;
    }
  }
}
