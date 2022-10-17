import { BN, BN_ZERO } from '@polkadot/util';
import { isAddress } from 'ethers/lib/utils';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { BridgeBase } from 'shared/core/bridge';
import {
  BridgeConfig,
  ChainConfig,
  CrossChainDirection,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  Network,
  Token,
  TokenWithBridgesInfo,
  Tx,
} from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { TxValidationMessages } from '../config/validation';
import { AllowancePayload } from '../model/allowance';
import { CrossChainPayload } from '../model/tx';
import { TxValidation } from '../model/validation';
import { isSubstrateSubstrateParachain, isXCM } from '../utils';

export interface TokenWithAmount extends Token {
  amount: BN; // with precision
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Bridge<B extends BridgeConfig, Origin extends ChainConfig, Target extends ChainConfig>
  extends BridgeBase<B, Origin, Target> {
  claim?(record: HelixHistoryRecord): Observable<Tx>;
  refund?(record: HelixHistoryRecord): Observable<Tx>;
  getDailyLimit?(
    direction: CrossChainDirection<CrossToken<Origin | Target>, CrossToken<Origin | Target>>
  ): Promise<DailyLimit | null>;
  getMinimumFeeTokenHolding?(direction: CrossChainDirection): TokenWithAmount | null;
  getAllowancePayload?(direction: CrossChainDirection): Promise<AllowancePayload | null>;
}

export abstract class Bridge<
  B extends BridgeConfig,
  Origin extends ChainConfig,
  Target extends ChainConfig
> extends BridgeBase<B, Origin, Target> {
  /**
   * Will be generated automatically through `yarn init:bridge` command. alias === Constructor.name
   *
   * @see https://github.com/helix-bridge/helix-ui/issues/334
   */
  static readonly alias: string;

  protected readonly txValidationMessages = TxValidationMessages;

  send(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<Origin | Target>, CrossToken<Target | Origin>>,
    fee?: BN
  ): Observable<Tx> {
    const {
      direction: { from: dep, to },
    } = payload;

    if (this.isIssue(dep.meta, to.meta)) {
      return this.back(payload as CrossChainPayload<BridgeBase<B>, CrossToken<Origin>, CrossToken<Target>>, fee);
    } else {
      return this.burn(payload as CrossChainPayload<BridgeBase<B>, CrossToken<Target>, CrossToken<Origin>>, fee);
    }
  }

  protected abstract back(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<Origin>, CrossToken<Target>>,
    fee?: BN
  ): Observable<Tx>;

  protected abstract burn(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<Target>, CrossToken<Origin>>,
    fee?: BN
  ): Observable<Tx>;

  abstract getFee(
    direction: CrossChainDirection<CrossToken<Origin | Target>, CrossToken<Origin | Target>>,
    account?: string | boolean // boolean: useWalletProvider
  ): Promise<TokenWithAmount | null>;

  // eslint-disable-next-line complexity
  validate(
    payload: CrossChainPayload<BridgeBase<B>, CrossToken<ChainConfig>, CrossToken<ChainConfig>>,
    options: TxValidation
  ): Observable<boolean> {
    const {
      direction: { from, to },
    } = payload;
    const amount = new BN(
      toWei({
        value: from.amount,
        decimals: isSubstrateSubstrateParachain(from.host, to.host) ? to.decimals : from.decimals,
      })
    );
    const { balance: originBalance, allowance, minAmount, dailyLimit, fee, feeTokenBalance } = options;
    const min = this.getMinimumFeeTokenHolding && this.getMinimumFeeTokenHolding(payload.direction);
    const balance = min ? originBalance.sub(min.amount) : originBalance;

    /**
     * if from.symbol === feeToken.symbol  -> fee + amount < balance
     * else -> fee < feeToken
     */
    const result = [
      // validate existence
      [!from.amount, 'Transfer amount is required'],
      [!to.amount || +to.amount < 0, 'Transfer amount invalid'],
      [!!this.getFee && (!fee || fee.lt(BN_ZERO)), 'Failed to get fee'],
      [!!this.getAllowancePayload && !allowance, 'Failed to get allowance'],
      [!!this.getDailyLimit && !dailyLimit, 'Failed to get daily limit'],
      // validate logic
      [balance.lt(amount), this.txValidationMessages.balanceLessThanAmount],
      [!!allowance && allowance.lt(amount), this.txValidationMessages.allowanceLessThanAmount],
      [!!dailyLimit && dailyLimit.lt(amount), this.txValidationMessages.dailyLimitLessThanAmount],
      [!!feeTokenBalance && feeTokenBalance.lt(fee!), this.txValidationMessages.balanceLessThanFee],
      [!!minAmount && minAmount.gt(amount), `Transfer amount must greater than or equal to ${minAmount}`],
      [isXCM(from.host, to.host) && !Number.isInteger(+from.amount), this.txValidationMessages.mustBeAnInteger],
    ].find((item) => item[0]);

    return of(result && result[1]).pipe(
      switchMap((res) => {
        if (isString(res)) {
          return throwError(() => <Pick<Tx, 'error' | 'status'>>{ error: new Error(res), status: 'error' });
        } else if (isBoolean(res)) {
          return EMPTY;
        } else {
          return of(true);
        }
      })
    );
  }

  getChainConfig(name: Network): Origin | Target {
    if (!name) {
      throw new Error(`You must pass a 'name' parameter to find the chain config`);
    }

    const result = [this.departure, this.arrival].find((item) => item.name === name);

    if (!result) {
      throw new Error(`Can not find the chain config by ${name}`);
    }

    return result;
  }

  protected isStrict(from: Network, to: Network) {
    return (departure: Network, arrival: Network) => departure === from && arrival === to;
  }

  protected is(from: Network, to: Network) {
    return (departure: Network, arrival: Network) =>
      (departure === from && arrival === to) || (departure === to && arrival === from);
  }

  getTokenConfigFromHelixRecord(
    record: HelixHistoryRecord,
    key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'sendToken' | 'recvToken'> = 'sendToken'
  ): TokenWithBridgesInfo {
    const chainName = record[key === 'recvToken' ? 'toChain' : 'fromChain'];
    const chain = this.getChainConfig(chainName);
    const symbol = record[key];

    return chain.tokens.find((item) => {
      if (isAddress(symbol)) {
        return item.address.toLowerCase() === symbol.toLowerCase();
      }
      const isSameSymbol = item.symbol === symbol;

      if (!isSameSymbol) {
        const isSameSymbolCaseInsensitive = item.symbol.toLowerCase() === symbol.toLowerCase();

        if (isSameSymbolCaseInsensitive) {
          console.log(
            `⚠️ Token symbol(${symbol}) from ${record.id} is not consistent with the symbol(${item.symbol}) stored in ${chain.name} configuration!`
          );
          return true;
        }
      }

      return isSameSymbol;
    })!;
  }
}
