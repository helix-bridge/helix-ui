import { BN, BN_ZERO } from '@polkadot/util';
import omit from 'lodash/omit';
import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
import { EMPTY } from 'rxjs/internal/observable/empty';
import type { Observable } from 'rxjs';
import { IssuingPayload, RedeemPayload, ShidenKhalaBridgeConfig } from '../model';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';

export class ShidenKhalaBridge extends Bridge<ShidenKhalaBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'ShidenKhalaBridge';

  back(_payload: IssuingPayload, _fee: BN): Observable<Tx> {
    return EMPTY;
  }

  burn(_payload: RedeemPayload, _fee: BN): Observable<Tx> {
    return EMPTY;
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
    return { ...omit(direction.from, ['meta', 'amount']), amount: BN_ZERO };
  }
}
