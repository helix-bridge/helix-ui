import { BN, BN_ZERO } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers';
import last from 'lodash/last';
import { EMPTY, from, Observable, switchMap } from 'rxjs';
import {
  BridgeName,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Bridge } from '../../../../core/bridge';
import { TxValidation } from '../../../../model';
import { getBridge } from '../../../../utils/bridge';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMSubstrateDVMBridgeConfig } from '../model';

export class SubstrateDVMSubstrateDVMBridge extends Bridge<
  SubstrateDVMSubstrateDVMBridgeConfig,
  DVMChainConfig,
  DVMChainConfig
> {
  static supportBridges: BridgeName[] = ['substrateDVM-substrateDVM'];

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction, bridge } = payload;
    const { from: departure, to } = direction;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
    const gasLimit = '1000000';

    return genEthereumContractTxObs(
      bridge.config.contracts!.backing,
      (contract) =>
        contract.lockAndRemoteIssuing(to.meta.specVersion, gasLimit, departure.address, recipient, amount, {
          from: sender,
          value: fee.toString(),
        }),
      backingAbi
    );
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const {
      sender,
      recipient,
      bridge,
      direction: { from: departure, to },
    } = payload;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
    const gasLimit = '1000000';

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) =>
        contract.burnAndRemoteUnlock(to.meta.specVersion, gasLimit, departure.address, recipient, amount, {
          from: sender,
          value: fee.toString(),
        }),
      burnAbi
    );
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
    const { fromChain, toChain, sendAmount: amount, sender, id, sendTokenAddress: tokenAddress } = record;
    const bridge = getBridge<SubstrateDVMSubstrateDVMBridgeConfig, DVMChainConfig, DVMChainConfig>([
      fromChain,
      toChain,
    ]);
    const [departure, arrival] = bridge.isIssue(fromChain, toChain)
      ? [bridge.departure, bridge.arrival]
      : [bridge.arrival, bridge.departure];

    const trimLaneId = (helixId: string) => {
      const res = last(helixId.split('-')) as string;
      return res.substring(10, id.length + 1);
    };
    const transferId = trimLaneId(id);

    const { abi, address, method } = bridge.isRedeem(fromChain, toChain)
      ? { abi: backingAbi, address: bridge.config.contracts?.backing, method: 'remoteIssuingFailure' }
      : { abi: burnAbi, address: bridge.config.contracts?.issuing, method: 'remoteUnlockFailure' };

    return isMetamaskChainConsistent(arrival).pipe(
      switchMap((isConsistent) =>
        isConsistent
          ? from(
              this.getFee({ from: { meta: arrival }, to: { meta: departure } } as CrossChainDirection<
                CrossToken<DVMChainConfig>,
                CrossToken<DVMChainConfig>
              >)
            )
          : EMPTY
      ),
      switchMap((value) =>
        genEthereumContractTxObs(
          address as string,
          (contract) =>
            contract[method](departure.specVersion, '2000000', transferId, tokenAddress, sender, amount).send({
              from: sender,
              value: value?.toString(),
            }),
          abi
        )
      )
    );
  }

  async getFee(direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>): Promise<BN> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;
    const bridge = getBridge([departure, arrival]);

    const { abi, address } = bridge.isIssue(departure, arrival)
      ? { abi: backingAbi, address: bridge.config.contracts?.backing }
      : { abi: burnAbi, address: bridge.config.contracts?.issuing };

    const contract = new Contract(address as string, abi, entrance.web3.currentProvider);

    const fee = await contract.fee();

    return new BN(fee.toString());
  }

  async getDailyLimit(
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
  ): Promise<DailyLimit | null> {
    const {
      from: { meta: departure, address: fromTokenAddress },
      to: { meta: arrival },
    } = direction;
    const bridge = getBridge([departure, arrival]);

    const { abi, address } = bridge.isIssue(departure, arrival)
      ? { abi: backingAbi, address: bridge.config.contracts?.backing }
      : { abi: burnAbi, address: bridge.config.contracts?.issuing };

    const contract = new Contract(address as string, abi, entrance.web3.currentProvider);

    const limit: BigNumber = await contract.dailyLimit(fromTokenAddress);
    const spentToday: BigNumber = await contract.spentToday(fromTokenAddress);

    return { limit: limit.toString(), spentToday: spentToday.toString() };
  }
}
