import { EMPTY, Observable } from 'rxjs';
import { BridgeConfig, BridgeName, ChainConfig, Tx } from 'shared/model';
import { Bridge } from '../../../core/bridge';

export class UnknownUnavailableBridge extends Bridge<BridgeConfig, ChainConfig, ChainConfig> {
  static supportBridges: BridgeName[] = [];

  back(): Observable<Tx> {
    return EMPTY;
  }

  burn(): Observable<Tx> {
    return EMPTY;
  }
}
