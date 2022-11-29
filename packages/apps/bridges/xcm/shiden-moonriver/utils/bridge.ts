import { BN, BN_ZERO } from '@polkadot/util';
import omit from 'lodash/omit';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { CrossChainDirection, CrossToken, ParachainChainConfig, Tx } from 'shared/model';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { IssuingPayload, RedeemPayload, ShidenMoonriverBridgeConfig } from '../model';

export class ShidenMoonriverBridge extends Bridge<
  ShidenMoonriverBridgeConfig,
  ParachainChainConfig,
  ParachainChainConfig
> {
  static readonly alias: string = 'ShidenMoonriverBridge';

  back(payload: IssuingPayload): Observable<Tx> {
    return this.xcmReserveTransferAssets(payload);
  }

  burn(_payload: RedeemPayload, _fee: BN): Observable<Tx> {
    return EMPTY;
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ParachainChainConfig>, CrossToken<ParachainChainConfig>>
  ): Promise<TokenWithAmount | null> {
    return { ...omit(direction.from, ['meta', 'amount']), amount: BN_ZERO };
  }
}
