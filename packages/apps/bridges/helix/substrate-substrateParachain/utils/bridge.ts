import type { Codec } from '@polkadot/types-codec/types';
import { BN, hexToU8a } from '@polkadot/util';
import last from 'lodash/last';
import lowerFirst from 'lodash/lowerFirst';
import upperFirst from 'lodash/upperFirst';
import { Observable } from 'rxjs';
import { crabConfig, crabParachainConfig, pangolinConfig } from 'shared/config/network';
import { pangolinParachainConfig } from 'shared/config/network/pangolin-parachain';
import { CrossChainDirection, CrossToken, PolkadotChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidation } from '../../../../model';
import { Bridge } from '../../../../core/bridge';
import { crabCrabParachainConfig, pangolinPangolinParachainConfig } from '../config';
import { IssuingPayload, RedeemPayload, SubstrateSubstrateParachainBridgeConfig } from '../model';

export class SubstrateSubstrateParachainBridge extends Bridge<
  SubstrateSubstrateParachainBridgeConfig,
  PolkadotChainConfig,
  PolkadotChainConfig
> {
  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
    const WEIGHT = '10000000000';
    const section = `from${upperFirst(to.meta.name)}Issuing`;
    const extrinsic = api.tx[section].burnAndRemoteUnlock(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
    const WEIGHT = '10000000000';
    const section = `to${to.host.split('-').map(upperFirst).join('')}Backing`;
    const extrinsic = api.tx[section].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  genTxParamsValidations({ balance, amount, dailyLimit }: TxValidation): [boolean, string][] {
    return [
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
      [!!dailyLimit && dailyLimit.lt(amount), this.txValidationMessages.dailyLimitLessThanAmount],
    ];
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<PolkadotChainConfig>>
  ): Promise<BN> {
    const {
      from: { meta: from },
      to: { meta: to },
    } = direction;
    const api = entrance.polkadot.getInstance(from.provider);
    const section = lowerFirst(`${to.name.split('-').map(upperFirst).join('')}FeeMarket`);

    await waitUntilConnected(api);

    const res = (await api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON())) as {
      id: string;
      collateral: number;
      fee: number;
    }[];

    const data = last(res)?.fee.toString();
    const marketFee = data?.startsWith('0x') ? hexToU8a(data) : data;

    return new BN(marketFee ?? -1); // -1: fee market does not available
  }
}

export const crabCrabParachain = new SubstrateSubstrateParachainBridge(
  crabConfig,
  crabParachainConfig,
  crabCrabParachainConfig,
  {
    category: 'helix',
    activeArrivalConnection: true,
    name: 'substrate-substrateParachain',
    issueCompName: 'Substrate2Parachain',
    redeemCompName: 'Parachain2Substrate',
  }
);

export const pangolinPangolinParachain = new SubstrateSubstrateParachainBridge(
  pangolinConfig,
  pangolinParachainConfig,
  pangolinPangolinParachainConfig,
  {
    category: 'helix',
    activeArrivalConnection: true,
    name: 'substrate-substrateParachain',
    issueCompName: 'Substrate2Parachain',
    redeemCompName: 'Parachain2Substrate',
  }
);
