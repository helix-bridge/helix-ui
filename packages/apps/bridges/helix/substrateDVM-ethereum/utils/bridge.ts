import { BN } from '@polkadot/util';
import { Contract } from 'ethers';
import last from 'lodash/last';
import { from, Observable, switchMap } from 'rxjs';
import {
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
import { isNativeToken } from 'shared/utils/helper/validator';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { getBridge, isSubstrateDVM2Ethereum } from 'utils/bridge';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
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
  static readonly alias: string = 'SubstrateDVMEthereumBridge';

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
    console.log('%cbridge.ts line:45 params', 'color: white; background-color: #007acc;', params, fee.toString());
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
  ): Promise<TokenWithAmount | null> {
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
      useWallerProvider ? entrance.web3.currentProvider : entrance.web3.getInstance(direction.from.meta.provider.https)
    );

    try {
      const fee = await contract.currentFee();

      return { ...direction.from.meta.tokens.find(isNativeToken)!, amount: new BN(fee.toString()) };
    } catch {
      return null;
    }
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

    const contract = new Contract(address as string, abi, entrance.web3.getInstance(direction.to.meta.provider.https));

    try {
      const limit = await contract.calcMaxWithdraw(type === 'native' ? getWrappedToken(arrival).address : tokenAddress);

      return { limit: limit.toString(), spentToday: '0' };
    } catch {
      return null;
    }
  }

  getMinimumFeeTokenHolding(
    direction: CrossChainDirection<
      CrossToken<DVMChainConfig | EthereumChainConfig>,
      CrossToken<DVMChainConfig | EthereumChainConfig>
    >
  ): TokenWithAmount | null {
    const { from: dep, to } = direction;

    if (this.isIssue(dep.meta, to.meta) && dep.type === 'native') {
      return { ...dep, amount: new BN(toWei({ value: 1, decimals: dep.decimals })) };
    }

    return null;
  }

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<EthereumChainConfig>>
  ): Promise<AllowancePayload | null> {
    if (direction.from.type === 'erc20' && this.isIssue(direction.from.host, direction.to.host)) {
      return {
        spender: this.config.contracts.backing,
        tokenAddress: direction.from.address || getWrappedToken(direction.from.meta).address,
      };
    }

    if (this.isRedeem(direction.from.host, direction.to.host)) {
      return {
        spender: this.config.contracts.issuing,
        tokenAddress: direction.from.address,
      };
    }

    return null;
  }
}
