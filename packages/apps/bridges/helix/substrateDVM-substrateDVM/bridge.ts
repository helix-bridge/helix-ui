import { BN, BN_ZERO } from '@polkadot/util';
import { EMPTY, Observable } from 'rxjs';
import { crabDVMConfig, darwiniaDVMConfig, pangolinDVMConfig, pangoroDVMConfig } from 'shared/config/network';
import { CrossChainDirection, CrossToken, DailyLimit, DVMChainConfig, HelixHistoryRecord, Tx } from 'shared/model';
import { TxValidation } from '../../../model';
import { Bridge } from '../../../model/bridge';
import { darwiniaDVMcrabDVMConfig, pangoroDVMpangolinDVMConfig } from './config';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateDVMBridgeConfig } from './model';
import { getDailyLimit } from './utils/dailyLimit';
import { getFee } from './utils/fee';
import { issue, redeem, refund } from './utils/tx';

export class SubstrateDVMSubstrateDVMBridge extends Bridge<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    return issue(payload, fee);
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    return redeem(payload, fee);
  }

  genTxParamsValidations(params: TxValidation): [boolean, string][] {
    const { balance, amount, dailyLimit, allowance, fee, feeTokenBalance } = params;

    return [
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
      [!!dailyLimit && dailyLimit.lt(amount), this.txValidationMessages.dailyLimitLessThanAmount],
      [!!allowance && allowance?.lt(amount), this.txValidationMessages.allowanceLessThanAmount],
      [!!fee && fee.lt(BN_ZERO), this.txValidationMessages.invalidFee],
      [!!feeTokenBalance && feeTokenBalance.lt(fee!), this.txValidationMessages.balanceLessThanFee],
    ];
  }

  claim(_: HelixHistoryRecord): Observable<Tx> {
    return EMPTY;
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    return refund(record);
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

export const pangoroDVMPangolinDVM = new SubstrateDVMSubstrateDVMBridge(
  pangoroDVMConfig,
  pangolinDVMConfig,
  pangoroDVMpangolinDVMConfig,
  {
    name: 'substrateDVM-substrateDVM',
    category: 'helix',
  }
);
