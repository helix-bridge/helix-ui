import { EMPTY, Observable } from 'rxjs';
import { crabConfig, pangoroConfig } from 'shared/config/network';
import { BridgeConfig, ChainConfig, Tx } from 'shared/model';
import { Bridge } from '../../../model/bridge';
import { unknownUnavailableConfig } from '../config';

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

export const unknownUnavailable = new UnknownUnavailableBridge(pangoroConfig, crabConfig, unknownUnavailableConfig, {
  category: 'helix',
  name: 'substrate-DVM',
  issueCompName: 'Unknown2Unavailable',
  redeemCompName: 'Unavailable2Unknown',
});
