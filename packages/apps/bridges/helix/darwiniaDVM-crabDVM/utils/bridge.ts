import { BN, BN_ZERO } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers/lib/ethers';
import remove from 'lodash/remove';
import { from, Observable, switchMap } from 'rxjs';
import {
  ChainConfig,
  CrossChainDirection,
  CrossChainPureDirection,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  HelixHistoryRecord,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { sendTransactionFromContract } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import { getWrappedToken } from '../../../../utils/network/network';
import backingAbi from '../config/backing.json';
import burnAbi from '../config/mappingToken.json';
import { DarwiniaDVMCrabDVMBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class DarwiniaDVMCrabDVMBridge extends Bridge<DarwiniaDVMCrabDVMBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'DarwiniaDVMCrabDVMBridge';

  private gasLimit = '1000000';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction, bridge } = payload;
    const { from: departure, to } = direction;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));
    const fullParams = [
      to.meta.specVersion,
      this.gasLimit,
      departure.address,
      recipient,
      amount.toString(),
      {
        from: sender,
        value: departure.type === 'native' ? amount.add(fee).toString() : fee.toString(),
      },
    ];
    const [method, params] =
      direction.from.type === 'native'
        ? ['lockAndRemoteIssuingNative', remove(fullParams, (_, index) => index !== 2)]
        : ['lockAndRemoteIssuing', fullParams];

    return sendTransactionFromContract(
      bridge.config.contracts!.backing,
      (contract) => contract[method].apply(this, params),
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
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));
    const fullParams = [
      to.meta.specVersion,
      this.gasLimit,
      departure.address,
      recipient,
      amount.toString(),
      {
        from: sender,
        value: fee.toString(),
      },
    ];
    const [method, params] =
      to.type === 'native'
        ? ['burnAndRemoteUnlockNative', remove(fullParams, (_, index) => index !== 2)]
        : ['burnAndRemoteUnlock', fullParams];

    return sendTransactionFromContract(
      bridge.config.contracts!.issuing,
      (contract) => contract[method].apply(this, params),
      burnAbi
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;
    const token = departure.tokens.find((item) => isRing(item.symbol))!;

    if (!isRing(direction.from.symbol)) {
      return { ...token, amount: BN_ZERO };
    }

    const { abi, address } = this.isIssue(departure, arrival)
      ? { abi: backingAbi, address: this.config.contracts?.backing }
      : { abi: burnAbi, address: this.config.contracts?.issuing };
    const contract = new Contract(address as string, abi, entrance.web3.getInstance(departure.provider.https));

    try {
      const fee = await contract.fee();

      return { ...token, amount: new BN(fee.toString()) };
    } catch {
      return { ...token, amount: new BN(-1) };
    }
  }

  async getDailyLimit(
    direction: CrossChainPureDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>
  ): Promise<DailyLimit> {
    const {
      from: { meta: departure },
      to: { meta: arrival, address: toTokenAddress },
    } = direction;

    const { abi, address } = this.isRedeem(departure, arrival)
      ? { abi: backingAbi, address: this.config.contracts?.backing }
      : { abi: burnAbi, address: this.config.contracts?.issuing };

    const contract = new Contract(address as string, abi, entrance.web3.getInstance(arrival.provider.https));

    try {
      const limit: BigNumber = await contract.calcMaxWithdraw(
        toTokenAddress ? toTokenAddress : getWrappedToken(arrival).address
      );

      return { limit: limit.toString(), spentToday: '0' };
    } catch {
      return { limit: '-1', spentToday: '0' };
    }
  }

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
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

  getMinimumFeeTokenHolding(
    direction: CrossChainDirection<
      CrossToken<DVMChainConfig | DVMChainConfig>,
      CrossToken<DVMChainConfig | DVMChainConfig>
    >
  ): TokenWithAmount | null {
    const { from: dep, to } = direction;

    if (this.isIssue(dep.meta, to.meta) && dep.type === 'native') {
      return { ...dep, amount: new BN(toWei({ value: 1, decimals: dep.decimals })) };
    }

    return null;
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { sender, sendTokenAddress, sendAmount, fromChain, toChain } = record;
    const sendToken = this.getTokenConfigFromHelixRecord(record, 'sendToken');
    const recvToken = this.getTokenConfigFromHelixRecord(record, 'recvToken');

    const { contractAddress, abi, method, departure, arrival } = this.isIssue(fromChain, toChain)
      ? {
          contractAddress: this.config.contracts!.issuing,
          abi: burnAbi,
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

    const fullParams = [
      (departure as DVMChainConfig).specVersion,
      this.gasLimit,
      record.messageNonce,
      sendTokenAddress,
      sender,
      sendAmount,
    ];
    const sendTokenAddressIndex = 3;
    const params =
      sendToken.type === 'native' ? remove(fullParams, (_, index) => index !== sendTokenAddressIndex) : fullParams;

    const direction = {
      from: { ...recvToken, meta: arrival },
      to: { ...sendToken, meta: departure },
    } as CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>;

    return isMetamaskChainConsistent(this.getChainConfig(toChain)).pipe(
      switchMap(() => from(this.getFee(direction))),
      switchMap((fee) => {
        return sendTransactionFromContract(
          contractAddress,
          (contract) => contract[method].apply(null, [...params, { value: fee?.amount.toString() }]),
          abi
        );
      })
    );
  }
}
