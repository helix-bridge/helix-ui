import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import { crabParachainConfig, moonriverConfig } from 'shared/config/network';
import {
  CrossChainDirection,
  CrossToken,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { getBridge } from 'utils/bridge';
import { TxValidation } from '../../../../model';
import { Bridge } from '../../../../core/bridge';
import { crabParachainMoonriverConfig } from '../config';
import abi from '../config/abi.json';
import { CrabParachainMoonriverBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class CrabParachainMoonriverBridge extends Bridge<
  CrabParachainMoonriverBridgeConfig,
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig
> {
  private patchAmount(departure: CrossToken) {
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

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
    } = payload;
    const bridge = getBridge([departure.meta, arrival.meta]);
    const amount = this.patchAmount(departure);
    const destination = [1, ['0x0000000839', `0x01${convertToDvm(recipient).slice(2)}00`]];
    const weight = 4_000_000_000;

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract.transfer(departure.address, amount, destination, weight, { from: sender }),
      abi
    );
  }

  genTxParamsValidations({ amount, balance }: TxValidation): [boolean, string][] {
    const decimals = +fromWei({ value: amount });

    return [
      [!Number.isInteger(decimals), this.txValidationMessages.mustBeAnInteger],
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
    ];
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<BN> {
    const { from, to } = direction;

    if (this.isIssue(from.host, to.host)) {
      return new BN('11800000000000000000');
    } else {
      return new BN('3200000000000000000');
    }
  }
}

export const crabParachainMoonriver = new CrabParachainMoonriverBridge(
  crabParachainConfig,
  moonriverConfig,
  crabParachainMoonriverConfig,
  {
    name: 'crabParachain-moonriver',
    category: 'XCM',
  }
);
