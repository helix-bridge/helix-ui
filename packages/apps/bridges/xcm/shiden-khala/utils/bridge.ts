import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenKhalaBridgeConfig } from '../model';

export class ShidenKhalaBridge extends Bridge<ShidenKhalaBridgeConfig, ParachainChainConfig, ParachainChainConfig> {
  static readonly alias: string = 'ShidenKhalaBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
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
