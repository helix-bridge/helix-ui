import { BN, BN_ZERO } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers';
import { EMPTY, from, Observable, switchMap } from 'rxjs';
import {
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  DVMChainConfig,
  HelixHistoryRecord,
  Tx,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';
import { IssuingPayload, RedeemPayload, DarwiniaDVMCrabDVMBridgeConfig } from '../model';

export class DarwiniaDVMCrabDVMBridge extends Bridge<DarwiniaDVMCrabDVMBridgeConfig, DVMChainConfig, DVMChainConfig> {
  static readonly alias: string = 'DarwiniaDVMCrabDVMBridge';

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

  claim(_: HelixHistoryRecord): Observable<Tx> {
    return EMPTY;
  }

  refund(record: HelixHistoryRecord): Observable<Tx> {
    const { fromChain, toChain, sendAmount: amount, sender, id, sendTokenAddress: tokenAddress } = record;
    const sendToken = this.getTokenConfigFromHelixRecord(record, 'sendToken');
    const recvToken = this.getTokenConfigFromHelixRecord(record, 'recvToken');

    const { abi, address, method, departure, arrival } = this.isRedeem(fromChain, toChain)
      ? {
          abi: backingAbi,
          address: this.config.contracts?.backing,
          method: 'remoteIssuingFailure',
          departure: this.arrival,
          arrival: this.departure,
        }
      : {
          abi: burnAbi,
          address: this.config.contracts?.issuing,
          method: 'remoteUnlockFailure',
          departure: this.departure,
          arrival: this.arrival,
        };

    const direction = {
      from: { ...recvToken, meta: arrival },
      to: { ...sendToken, meta: departure },
    } as CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>;

    return isMetamaskChainConsistent(arrival).pipe(
      switchMap((isConsistent) => (isConsistent ? from(this.getFee(direction)) : EMPTY)),
      switchMap((fee) =>
        genEthereumContractTxObs(
          address as string,
          (contract) =>
            contract[method](
              (departure as DVMChainConfig).specVersion,
              '2000000',
              this.trimLaneId(id),
              tokenAddress,
              sender,
              amount,
              { value: fee?.amount.toString() }
            ),
          abi
        )
      )
    );
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
  ): Promise<TokenWithAmount> {
    const {
      from: { meta: departure },
      to: { meta: arrival },
    } = direction;
    const token = direction.from.meta.tokens.find((item) => isRing(item.symbol))!;

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
    direction: CrossChainDirection<CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
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
      const limit: BigNumber = await contract.dailyLimit(toTokenAddress);
      const spentToday: BigNumber = await contract.spentToday(toTokenAddress);

      return { limit: limit.toString(), spentToday: spentToday.toString() };
    } catch {
      return { limit: '-1', spentToday: '0' };
    }
  }

  async getAllowancePayload(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<AllowancePayload> {
    return {
      spender: this.isIssue(direction.from.meta, direction.to.meta)
        ? this.config.contracts.backing
        : this.config.contracts.issuing,
      tokenAddress: direction.from.address,
    };
  }
}
