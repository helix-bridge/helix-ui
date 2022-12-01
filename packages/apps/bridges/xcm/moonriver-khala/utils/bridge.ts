import { BN, numberToHex } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import {
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract, signAndSendExtrinsic } from 'shared/utils/tx';
import abi from '../../../../config/abi/moonriver.json';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, MoonriverKhalaBridgeConfig, RedeemPayload } from '../model';

export class MoonriverKhalaBridge extends Bridge<
  MoonriverKhalaBridgeConfig,
  ParachainEthereumCompatibleChainConfig,
  ParachainChainConfig
> {
  static readonly alias: string = 'MoonriverKhalaBridge';

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
                PalletInstance: departure.extra!.palletInstance,
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
            AccountKey20: {
              network: api.createType('XcmV0JunctionNetworkId', 'Any'),
              key: recipient,
            },
          }),
        ],
      }),
    });

    const destWeight = 6e9;
    const extrinsic = api.tx.xTransfer.transfer(asset, dest, destWeight);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);
    const amount = this.isIssue(from.host, to.host) ? new BN('266666666666400') : new BN('80000000000000');

    return { ...token, amount } as TokenWithAmount;
  }
}
