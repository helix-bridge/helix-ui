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
import { getBridge } from 'utils/bridge';
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
    const { from: departure } = direction;
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
      this.config.contracts!.backing,
      (contract) => contract[method].apply(null, args),
      backingAbi
    );
  }

  burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction } = payload;
    const { from: departure, to } = direction;
    const bridge = getBridge(direction, 'helix');
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
    const { messageNonce, endTime, recvTokenAddress, recvAmount, guardSignatures, recipient, toChain } = record;
    const signatures = guardSignatures?.split('-').slice(1);
    const contractAddress = this.config.contracts.guard;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() =>
        genEthereumContractTxObs(
          contractAddress,
          (contract) => contract.claim(messageNonce, endTime, recvTokenAddress, recipient, recvAmount, signatures),
          guardAbi
        )
      )
    );
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { sender, sendTokenAddress, sendAmount, fromChain, toChain } = record;
    const id = last(record.id.split('-'));
    const sendToken = this.getTokenConfigFromHelixRecord(record, 'sendToken');

    const { contractAddress, abi, method, departure, arrival } = this.isIssue(fromChain, toChain)
      ? {
          contractAddress: this.config.contracts!.issuing,
          abi: mappingTokenAbi,
          method: sendToken.type === 'native' ? 'remoteUnlockFailureNative' : 'remoteUnlockFailure',
          departure: this.departure,
          arrival: this.arrival,
        }
      : {
          contractAddress: this.config.contracts!.backing,
          abi: backingAbi,
          method: 'remoteIssuingFailure',
          departure: this.arrival,
          arrival: this.departure,
        };

    const args = sendToken.type === 'native' ? [id, sender, sendAmount] : [id, sendTokenAddress, sender, sendAmount];
    const direction = { from: { meta: arrival }, to: { meta: departure } } as CrossChainDirection<
      CrossToken<DVMChainConfig>,
      CrossToken<EthereumChainConfig>
    >;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() => from(this.getFee(direction, true))),
      switchMap((fee) => {
        return genEthereumContractTxObs(
          contractAddress,
          (contract) => contract[method].apply(null, [...args, { value: fee?.amount.toString() }]),
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
  ): Promise<TokenWithAmount> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;

    const { abi, address } = this.isIssue(departure, arrival)
      ? { abi: backingAbi, address: this.config.contracts?.backing }
      : { abi: mappingTokenAbi, address: this.config.contracts?.issuing };

    const contract = new Contract(
      address as string,
      abi,
      useWallerProvider ? entrance.web3.currentProvider : entrance.web3.getInstance(departure.provider.https)
    );
    const targetToken = departure.tokens.find(isNativeToken)!;

    try {
      const fee = await contract.currentFee();

      return { ...targetToken, amount: new BN(fee.toString()) };
    } catch {
      return { ...targetToken, amount: new BN(-1) };
    }
  }

  async getDailyLimit(
    direction: CrossChainDirection<
      CrossToken<EthereumChainConfig | DVMChainConfig>,
      CrossToken<EthereumChainConfig | DVMChainConfig>
    >
  ): Promise<DailyLimit> {
    const {
      from: { meta: departure },
      to: { meta: arrival, address: tokenAddress, type },
    } = direction;

    const { abi, address } = this.isIssue(departure, arrival)
      ? { abi: mappingTokenAbi, address: this.config.contracts?.issuing }
      : { abi: backingAbi, address: this.config.contracts?.backing };

    const contract = new Contract(address as string, abi, entrance.web3.getInstance(direction.to.meta.provider.https));

    try {
      const limit = await contract.calcMaxWithdraw(type === 'native' ? getWrappedToken(arrival).address : tokenAddress);

      return { limit: limit.toString(), spentToday: '0' };
    } catch {
      return { limit: '-1', spentToday: '0' };
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
