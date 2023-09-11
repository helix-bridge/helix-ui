import { BN } from '@polkadot/util';
import { DVMChainConfig, Tx } from 'shared/model';
import { Observable } from 'rxjs';
import { IssuingPayload, RedeemPayload, EthereumMantleBridgeConfig } from '../model';
import { LnBridgeBridge } from '../../lnbridge/utils/bridge';

export class EthereumMantleBridge extends LnBridgeBridge<EthereumMantleBridgeConfig, DVMChainConfig, DVMChainConfig> {
  static readonly alias: string = 'EthereumMantleLnBridge';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }
}
