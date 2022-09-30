import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import { darwiniaDVMConfig, pangoroDVMConfig } from 'shared/config/network';
import { CrossChainDirection, CrossToken, DVMChainConfig, TokenInfoWithMeta, Tx } from 'shared/model';
import { getErc20Balance, getEthereumNativeBalance } from 'shared/utils/network/balance';
import { TxValidation } from '../../../model';
import { Bridge } from '../../../model/bridge';
import { darwiniaDVMDarwiniaDVMConfig, pangoroDVMPangoroDVMConfig } from './config';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateDVMBridgeConfig } from './model';
import { deposit, withdraw } from './utils/tx';

export class SubstrateDVMSubstrateDVMBridgeInner extends Bridge<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  back(payload: IssuingPayload): Observable<Tx> {
    return deposit(payload);
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    return withdraw(payload);
  }

  genTxParamsValidations(params: TxValidation): [boolean, string][] {
    const { balance, amount } = params;

    return [[balance.lt(amount), this.txValidationMessages.balanceLessThanAmount]];
  }

  getBalance(direction: CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>, account: string) {
    const { from } = direction;

    return Promise.all([
      getErc20Balance(from.address, account, from.meta.provider),
      getEthereumNativeBalance(account, from.meta.provider),
    ]);
  }

  async getFee(_: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>): Promise<BN | null> {
    return null;
  }
}

export const darwiniaDVMDarwiniaDVM = new SubstrateDVMSubstrateDVMBridgeInner(
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

export const pangoroDVMPangoroDVM = new SubstrateDVMSubstrateDVMBridgeInner(
  pangoroDVMConfig,
  pangoroDVMConfig,
  pangoroDVMPangoroDVMConfig,
  {
    name: 'substrateDVM-substrateDVM',
    category: 'helix',
    issueCompName: 'SubstrateDVMInner',
    redeemCompName: 'SubstrateDVMInner',
  }
);
