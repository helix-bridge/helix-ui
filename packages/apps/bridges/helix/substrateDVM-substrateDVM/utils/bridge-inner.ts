import { BN } from '@polkadot/util';
import { Observable } from 'rxjs';
import { darwiniaDVMConfig, pangoroDVMConfig } from 'shared/config/network';
import { CrossChainDirection, CrossToken, DVMChainConfig, Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { TxValidation } from '../../../../model';
import { Bridge } from '../../../../model/bridge';
import { darwiniaDVMDarwiniaDVMConfig, pangoroDVMPangoroDVMConfig } from '../config';
import wringABI from '../config/wring.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateDVMBridgeConfig } from '../model';

export class SubstrateDVMSubstrateDVMBridgeInner extends Bridge<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  back(payload: IssuingPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract.deposit({ from: sender, value: amount.toString() }),
      wringABI
    );
  }

  burn(payload: RedeemPayload): Observable<Tx> {
    const {
      sender,
      bridge,
      direction: { from: departure },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract.withdraw(amount.toString(), { from: sender }),
      wringABI
    );
  }

  genTxParamsValidations(params: TxValidation): [boolean, string][] {
    const { balance, amount } = params;

    return [[balance.lt(amount), this.txValidationMessages.balanceLessThanAmount]];
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
