import { EMPTY, Observable } from 'rxjs';
import { BridgeConfig, ChainConfig, Tx } from 'shared/model';
import { Bridge } from '../../../core/bridge';

export class UnknownUnavailableBridge extends Bridge<BridgeConfig, ChainConfig, ChainConfig> {
  back(): Observable<Tx> {
    return EMPTY;
  }

  burn(): Observable<Tx> {
    return EMPTY;
  }

  genTxParamsValidations(): [boolean, string][] {
    return [];
  }
}
