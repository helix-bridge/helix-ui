import { BN, numberToHex } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract, signAndSendExtrinsic } from 'shared/utils/tx';
import abi from '../../../../config/abi/moonriver.json';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, MoonriverShidenBridgeConfig, RedeemPayload } from '../model';

export class MoonriverShidenBridge extends Bridge<MoonriverShidenBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'MoonriverShidenBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    // [hex paraId, AccountId32 Network Any]
    const destination = [
      1,
      [`0x000000${numberToHex(arrival.meta.paraId).slice(2)}`, `0x01${convertToDvm(recipient).slice(2)}00`],
    ];
    const weight = 4_000_000_000;

    return sendTransactionFromContract(
      this.config.contracts!.backing,
      (contract) => contract.transfer(departure.address, amount, destination, weight, { from: sender }),
      abi
    );
  }

  burn(payload: RedeemPayload): Observable<Tx> {
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
              parents: 1,
              interior: api.createType('XcmV1MultilocationJunctions', {
                X1: api.createType('XcmV1Junction', {
                  PalletInstance: departure.extra!.palletInstance,
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
    const extrinsic = api.tx.polkadotXcm.reserveWithdrawAssets(dest, beneficiary, assets, feeAssetItem);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);
    const amount = this.isIssue(from.host, to.host) ? new BN('140400000000000') : new BN('400000000000000');

    return { ...token, amount } as TokenWithAmount;
  }
}
