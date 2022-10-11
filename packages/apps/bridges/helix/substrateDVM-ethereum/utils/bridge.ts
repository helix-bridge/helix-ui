import { BN, BN_ZERO } from '@polkadot/util';
import { Contract } from 'ethers';
import last from 'lodash/last';
import { from, Observable, switchMap } from 'rxjs';
import {
  BridgeName,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  EthereumChainConfig,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { getBridge, isSubstrateDVM2Ethereum } from 'utils/bridge';
import { Bridge } from '../../../../core/bridge';
import { TxValidation } from '../../../../model';
import { getWrappedToken } from '../../../../utils/network';
import backingAbi from '../config/backing.json';
import guardAbi from '../config/guard.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMEthereumBridgeConfig } from '../model';

export class SubstrateDVMEthereumBridge extends Bridge<
  SubstrateDVMEthereumBridgeConfig,
  DVMChainConfig,
  EthereumChainConfig
> {
  static supportBridges: BridgeName[] = ['substrateDVM-ethereum'];

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const bridge = getBridge([departure.meta, to.meta]);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));
    const params = [
      departure.address,
      recipient,
      amount.toString(),
      { from: sender, value: departure.type === 'native' ? amount.add(fee).toString() : fee.toString() },
    ];
    const { method, args } =
      departure.type === 'native'
        ? { method: 'lockAndRemoteIssuingNative', args: params.slice(1) }
        : { method: 'lockAndRemoteIssuing', args: params };

    return genEthereumContractTxObs(
      bridge.config.contracts!.backing,
      (contract) => contract[method].apply(null, args),
      backingAbi
    );
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const bridge = getBridge([departure.meta, to.meta]);
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));
    const params = [departure.address, recipient, amount.toString(), { from: sender, value: fee.toString() }];
    const { method, args } =
      to.type === 'native'
        ? { method: 'burnAndRemoteUnlockNative', args: params.slice(1) }
        : { method: 'burnAndRemoteUnlock', args: params };

    return genEthereumContractTxObs(
      bridge.config.contracts!.issuing,
      (contract) => contract[method].apply(null, args),
      mappingTokenAbi
    );
  }

  genTxParamsValidations({
    balance,
    amount,
    dailyLimit,
    allowance,
    fee,
    feeTokenBalance,
  }: TxValidation): [boolean, string][] {
    return [
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
      [!!dailyLimit && dailyLimit.lt(amount), this.txValidationMessages.dailyLimitLessThanAmount],
      [!!allowance && allowance?.lt(amount), this.txValidationMessages.allowanceLessThanAmount],
      [!!fee && fee?.lt(BN_ZERO), this.txValidationMessages.invalidFee],
      [!!feeTokenBalance && feeTokenBalance.lt(fee!), this.txValidationMessages.balanceLessThanFee],
    ];
  }

  claim(record: HelixHistoryRecord): Observable<Tx> {
    const {
      messageNonce,
      endTime,
      recvTokenAddress,
      recvAmount,
      guardSignatures,
      recipient,
      fromChain,
      toChain,
      sender,
    } = record;
    const signatures = guardSignatures?.split('-').slice(1);
    const bridge = getBridge<SubstrateDVMEthereumBridgeConfig>([fromChain, toChain]);

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() =>
        genEthereumContractTxObs(
          bridge.config.contracts!.guard,
          (contract) =>
            contract.claim(messageNonce, endTime, recvTokenAddress, recipient, recvAmount, signatures, {
              from: sender,
            }),
          guardAbi
        )
      )
    );
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { sender, sendTokenAddress, sendAmount, fromChain, toChain } = record;
    const id = last(record.id.split('-'));
    const bridge = getBridge<SubstrateDVMEthereumBridgeConfig>([fromChain, toChain]);
    const fromChainConfig = this.getChainConfig(toChain);
    const toChainConfig = this.getChainConfig(fromChain);
    const sendToken = this.getTokenConfigFromHelixRecord(record);

    const { contractAddress, abi, method } = isSubstrateDVM2Ethereum(fromChain, toChain)
      ? {
          contractAddress: bridge.config.contracts!.issuing,
          abi: mappingTokenAbi,
          method: sendToken.type === 'native' ? 'remoteUnlockFailureNative' : 'remoteUnlockFailure',
        }
      : { contractAddress: bridge.config.contracts!.backing, abi: backingAbi, method: 'remoteIssuingFailure' };

    const args = sendToken.type === 'native' ? [id, sender, sendAmount] : [id, sendTokenAddress, sender, sendAmount];
    const direction = { from: { meta: fromChainConfig }, to: { meta: toChainConfig } } as CrossChainDirection<
      CrossToken<DVMChainConfig>,
      CrossToken<EthereumChainConfig>
    >;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() => from(this.getFee(direction, true))),
      switchMap((fee) => {
        return genEthereumContractTxObs(
          contractAddress,
          (contract) =>
            contract[method].apply(null, [
              ...args,
              {
                from: sender,
                value: fee?.toString(),
              },
            ]),
          abi
        );
      })
    );
  }

  async getFee(
    direction: CrossChainDirection<
      CrossToken<DVMChainConfig | EthereumChainConfig>,
      CrossToken<DVMChainConfig | EthereumChainConfig>
    >,
    useWallerProvider = false
  ): Promise<BN> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;
    const bridge = getBridge([departure, arrival]);

    const { abi, address } = bridge.isIssue(departure, arrival)
      ? { abi: backingAbi, address: bridge.config.contracts?.backing }
      : { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing };

    const contract = new Contract(
      address as string,
      abi,
      useWallerProvider ? entrance.web3.currentProvider : entrance.web3.getInstance(direction.from.meta.provider)
    );

    const fee = await contract.currentFee();

    return new BN(fee.toString());
  }

  async getDailyLimit(
    direction: CrossChainDirection<
      CrossToken<EthereumChainConfig | DVMChainConfig>,
      CrossToken<EthereumChainConfig | DVMChainConfig>
    >
  ): Promise<DailyLimit | null> {
    const {
      from: { meta: departure },
      to: { meta: arrival, address: tokenAddress, type },
    } = direction;
    const bridge = getBridge([departure, arrival]);

    const { abi, address } = bridge.isIssue(departure, arrival)
      ? { abi: mappingTokenAbi, address: bridge.config.contracts?.issuing }
      : { abi: backingAbi, address: bridge.config.contracts?.backing };

    const contract = new Contract(address as string, abi, entrance.web3.getInstance(direction.to.meta.provider));

    const limit = await contract.calcMaxWithdraw(type === 'native' ? getWrappedToken(arrival).address : tokenAddress);

    return { limit: limit.toString(), spentToday: '0' };
  }
}
