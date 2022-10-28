import { BN, BN_ZERO } from '@polkadot/util';
import { BigNumber, Contract } from 'ethers/lib/ethers';
import { remove } from 'lodash';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import {
  ChainConfig,
  CrossChainDirection,
  CrossChainPureDirection,
  CrossToken,
  DailyLimit,
  TokenInfoWithMeta,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { isRing } from 'shared/utils/helper/validator';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { Bridge, TokenWithAmount } from '../../../../core/bridge';
import { AllowancePayload } from '../../../../model/allowance';
import backingAbi from '../config/backing.json';
import burnAbi from '../config/mappingToken.json';
import { CrabDVMDarwiniaDVMBridgeConfig, IssuingPayload, RedeemPayload } from '../model';

export class CrabDVMDarwiniaDVMBridge extends Bridge<CrabDVMDarwiniaDVMBridgeConfig, ChainConfig, ChainConfig> {
  static readonly alias: string = 'CrabDVMDarwiniaDVMBridge';

  back(payload: IssuingPayload, fee: BN): Observable<Tx> {
    const { sender, recipient, direction, bridge } = payload;
    const { from: departure, to } = direction;
    const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
    const gasLimit = '100';
    const fullParams = [
      to.meta.specVersion,
      gasLimit,
      departure.address,
      recipient,
      amount,
      {
        from: sender,
        value: fee.toString(),
      },
    ];
    const [method, params] =
      direction.from.type === 'native'
        ? ['lockAndRemoteIssuingNative', remove(fullParams, (_, index) => index !== 2)]
        : ['lockAndRemoteIssuing', fullParams];

    return genEthereumContractTxObs(
      bridge.config.contracts!.backing,
      (contract) => contract[method].apply(this, params),
      backingAbi
    );
  }

  burn(_payload: RedeemPayload, _fee: BN): Observable<Tx> {
    return EMPTY;
  }

  async getFee(
    direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
  ): Promise<TokenWithAmount | null> {
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
    direction: CrossChainPureDirection<TokenInfoWithMeta<ChainConfig>, TokenInfoWithMeta<ChainConfig>>
  ): Promise<DailyLimit> {
    const {
      from: { meta: departure, address: fromTokenAddress },
      to: { meta: arrival },
    } = direction;

    const { abi, address } = this.isIssue(departure, arrival)
      ? { abi: backingAbi, address: this.config.contracts?.backing }
      : { abi: burnAbi, address: this.config.contracts?.issuing };

    const contract = new Contract(address as string, abi, entrance.web3.getInstance(departure.provider.https));

    try {
      const limit: BigNumber = await contract.calcMaxWithdraw(fromTokenAddress);

      return { limit: limit.toString(), spentToday: '0' };
    } catch (err) {
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
