import { BN, numberToHex } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { abi } from 'shared/config/abi';
import {
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  ParachainEthereumCompatibleChainConfig,
  PolkadotChainConfig,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, MoonriverKaruraBridgeConfig, RedeemPayload } from '../model';

export class MoonriverKaruraBridge extends Bridge<
  MoonriverKaruraBridgeConfig,
  ParachainEthereumCompatibleChainConfig,
  PolkadotChainConfig
> {
  static readonly alias: string = 'MoonriverKaruraBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    // [hex paraId, AccountId32 Network Any]
    const destination = [
      1,
      [`0x000000${numberToHex(arrival.meta.paraId).slice(2)}`, `0x01${convertToDvm(recipient).slice(2)}00`],
    ];
    const weight = 4_000_000_000;

    return sendTransactionFromContract(
      this.config.contracts!.backing,
      (contract) => contract.transfer(departure.address, departure.amount, destination, weight, { from: sender }),
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
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const currencyId = api.createType('AcalaPrimitivesCurrencyCurrencyId', {
      ForeignAsset: departure.address,
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
    const extrinsic = api.tx.xTokens.transfer(currencyId, departure.amount, dest, destWeight);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);
    const amount = this.isIssue(from.host, to.host) ? new BN('92696000000000') : new BN('8000000000000');

    return { ...token, amount } as TokenWithAmount;
  }
}
