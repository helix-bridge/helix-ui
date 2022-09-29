import { BN } from '@polkadot/util';
import { EMPTY, Observable } from 'rxjs';
import { crabDVMConfig, darwiniaDVMConfig, pangolinDVMConfig, pangoroDVMConfig } from 'shared/config/network';
import {
  Bridge,
  BridgeConfig,
  ContractConfig,
  CrossChainDirection,
  CrossChainPayload,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  HelixHistoryRecord,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { getErc20Balance, getEthereumNativeBalance } from 'shared/utils/network/balance';
import { BridgePro } from '../../../../model/bridge';
import {
  darwiniaDVMcrabDVMConfig,
  darwiniaDVMDarwiniaDVMConfig,
  pangoroDVMpangolinDVMConfig,
  pangoroDVMPangoroDVMConfig,
} from '../config';
import { SubstrateDVMSubstrateDVMBridgeConfig } from '../model';
import { getDailyLimit } from './dailyLimit';
import { getFee } from './fee';
import { issue, redeem, refund } from './tx';

export class SubstrateDVMSubstrateDVMBridge extends BridgePro<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  issueHandle(
    payload: CrossChainPayload<
      Bridge<Required<BridgeConfig<ContractConfig>>>,
      CrossToken<DVMChainConfig>,
      CrossToken<DVMChainConfig>
    >,
    fee: BN
  ): Observable<Tx> {
    return issue(payload, fee);
  }
  redeemHandle(
    payload: CrossChainPayload<
      Bridge<Required<BridgeConfig<ContractConfig>>>,
      CrossToken<DVMChainConfig>,
      CrossToken<DVMChainConfig>
    >,
    fee: BN
  ): Observable<Tx> {
    return redeem(payload, fee);
  }

  claim(_: HelixHistoryRecord): Observable<Tx> {
    return EMPTY;
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    return refund(record);
  }

  getBalance(direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>, account: string) {
    const { from } = direction;

    return Promise.all([
      getErc20Balance(from.address, account, from.meta.provider),
      getEthereumNativeBalance(account, from.meta.provider),
    ]);
  }

  getFee(direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>): Promise<BN | null> {
    return getFee(direction);
  }

  getDailyLimit(
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
  ): Promise<DailyLimit | null> {
    return getDailyLimit(direction);
  }
}

export const darwiniaDVMCrabDVM = new SubstrateDVMSubstrateDVMBridge(
  darwiniaDVMConfig,
  crabDVMConfig,
  darwiniaDVMcrabDVMConfig,
  {
    name: 'substrateDVM-substrateDVM',
    category: 'helix',
  }
);

export const darwiniaDVMDarwiniaDVM = new SubstrateDVMSubstrateDVMBridge(
  darwiniaDVMConfig,
  darwiniaDVMConfig,
  darwiniaDVMDarwiniaDVMConfig,
  {
    name: 'substrateDVM-substrateDVM',
    category: 'helix',
    issueCompName: 'SubstrateDVMInner',
    redeemCompName: 'SubstrateDVMInner',
  }
);

export const pangoroDVMPangolinDVM = new SubstrateDVMSubstrateDVMBridge(
  pangoroDVMConfig,
  pangolinDVMConfig,
  pangoroDVMpangolinDVMConfig,
  {
    name: 'substrateDVM-substrateDVM',
    category: 'helix',
  }
);

export const pangoroDVMPangoroDVM = new Bridge(pangoroDVMConfig, pangoroDVMConfig, pangoroDVMPangoroDVMConfig, {
  name: 'substrateDVM-substrateDVM',
  category: 'helix',
  issueCompName: 'SubstrateDVMInner',
  redeemCompName: 'SubstrateDVMInner',
});
