import { BN } from '@polkadot/util';
import { DVMChainConfig, Tx } from 'shared/model';
import { Observable } from 'rxjs';
import { IssuingPayload, RedeemPayload, ArbitrumEthereumBridgeConfig } from '../model';
import { LnBridgeBridge } from '../../lnbridge/utils/bridge';

export class ArbitrumEthereumBridge extends LnBridgeBridge<
  ArbitrumEthereumBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  static readonly alias: string = 'ArbitrumEthereumLnBridge';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return this.send(payload, fee);
  }
}
