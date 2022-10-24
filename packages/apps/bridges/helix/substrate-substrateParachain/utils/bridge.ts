import type { Codec } from '@polkadot/types-codec/types';
import { BN, hexToU8a } from '@polkadot/util';
import last from 'lodash/last';
import lowerFirst from 'lodash/lowerFirst';
import omit from 'lodash/omit';
import upperFirst from 'lodash/upperFirst';
import { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, DailyLimit, PolkadotChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, SubstrateSubstrateParachainBridgeConfig } from '../model';

export class SubstrateSubstrateParachainBridge extends Bridge<
  SubstrateSubstrateParachainBridgeConfig,
  PolkadotChainConfig,
  PolkadotChainConfig
> {
  static readonly alias: string = 'SubstrateSubstrateParachainBridge';

  back(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider.wss);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
    const WEIGHT = '10000000000';
    const section = `to${to.host.split('-').map(upperFirst).join('')}Backing`;
    const extrinsic = api.tx[section].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  burn(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const api = entrance.polkadot.getInstance(direction.from.meta.provider.wss);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
    const WEIGHT = '10000000000';
    const section = `from${upperFirst(to.meta.name)}Issuing`;
    const extrinsic = api.tx[section].burnAndRemoteUnlock(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

    return signAndSendExtrinsic(api, sender, extrinsic);
  }

  async getDailyLimit(
    direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<PolkadotChainConfig>>
  ): Promise<DailyLimit | null> {
    const limit: BN | null = this.isIssue(direction.from.host, direction.to.host)
      ? await this.getIssueDailyLimit(direction)
      : await this.getRedeemDailyLimit(direction);

    return limit && { limit: limit.toString(), spentToday: '0' };
  }

  private async getIssueDailyLimit(
    direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<PolkadotChainConfig>>
  ) {
    const api = entrance.polkadot.getInstance(direction.to.meta.provider.https);

    await waitUntilConnected(api);

    const section = `from${upperFirst(direction.from.meta.name)}Issuing`;
    try {
      const result = await api.query[section].secureLimitedRingAmount();
      const data = result.toJSON() as [number, string]; // [0, hexString]
      const num = hexToU8a(data[1]);

      return new BN(num);
    } catch {
      return null;
    }
  }

  private async getRedeemDailyLimit(
    direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<PolkadotChainConfig>>
  ) {
    const api = entrance.polkadot.getInstance(direction.to.meta.provider.https);

    await waitUntilConnected(api);

    const section = `to${direction.from.meta.name.split('-').map(upperFirst).join('')}Backing`;
    try {
      const result = await api.query[section].secureLimitedRingAmount();
      const data = result.toJSON() as [number, number];
      const num = result && new BN(data[1]);

      return num;
    } catch {
      return null;
    }
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<PolkadotChainConfig>, CrossToken<PolkadotChainConfig>>
  ): Promise<TokenWithAmount | null> {
    const {
      from: { meta: from },
      to: { meta: to },
    } = direction;
    const api = entrance.polkadot.getInstance(from.provider.https);
    const section = lowerFirst(`${to.name.split('-').map(upperFirst).join('')}FeeMarket`);

    try {
      await waitUntilConnected(api);

      const res = (await api.query[section]['assignedRelayers']().then((data: Codec) => data.toJSON())) as {
        id: string;
        collateral: number;
        fee: number;
      }[];

      const data = last(res)?.fee.toString();
      const marketFee = data?.startsWith('0x') ? hexToU8a(data) : data;
      const token = omit(direction.from.meta.tokens.find((item) => isRing(item.symbol))!, ['amount', 'meta']);

      return { ...token, amount: new BN(marketFee ?? -1) } as TokenWithAmount; // -1: fee market does not available
    } catch {
      return null;
    }
  }

  getMinimumFeeTokenHolding(direction: CrossChainDirection): TokenWithAmount | null {
    const { from: dep } = direction;

    return { ...dep, amount: new BN(toWei({ value: 1, decimals: dep.decimals })) };
  }
}
