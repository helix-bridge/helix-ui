import { BN } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenKaruraBridgeConfig } from '../model';

export class ShidenKaruraBridge extends Bridge<ShidenKaruraBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'ShidenKaruraBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
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
        amount: new BN('926960000000000'),
      } as TokenWithAmount;
    } else {
      return { ...token, amount: new BN('4635101625000000') } as TokenWithAmount;
    }
  }
}
