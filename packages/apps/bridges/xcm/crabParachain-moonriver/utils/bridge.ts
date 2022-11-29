import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import { Observable } from 'rxjs';
import {
  CrossChainDirection,
  CrossToken,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { sendTransactionFromContract, signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import abi from '../../../../config/abi/moonriver.json';
import { CrabParachainMoonriverBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class CrabParachainMoonriverBridge extends Bridge<
  CrabParachainMoonriverBridgeConfig,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig
> {
  static readonly alias = 'CrabParachainMoonriverBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
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

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      direction: { from: departure },
      sender,
      recipient,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const destination = [1, ['0x0000000839', `0x01${convertToDvm(recipient).slice(2)}00`]];
    const weight = 4_000_000_000;

    return sendTransactionFromContract(
      this.config.contracts!.issuing,
      (contract) => contract.transfer(departure.address, amount, destination, weight, { from: sender }),
      abi
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount> {
    const { from, to } = direction;
    const token = omit(direction.from, ['amount', 'meta']);

    if (this.isIssue(from.host, to.host)) {
      return { ...token, amount: new BN('11800000000000000000') } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('4000000000000000000') } as TokenWithAmount;
    }
  }
}
