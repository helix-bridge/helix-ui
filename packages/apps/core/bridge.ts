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
  CrossChainPureDirection,
  CrossToken,
  DailyLimit,
  HelixHistoryRecord,
  Network,
  NullableFields,
  Token,
  TokenInfoWithMeta,
  TokenWithBridgesInfo,
  Tx,
} from 'shared/model';
import { fromWei, toWei } from 'shared/utils/helper/balance';
import { AllowancePayload } from '../model/allowance';
import { CrossChainPayload } from '../model/tx';
import { isCBridge, isXCM } from '../utils';

export interface TokenWithAmount extends Token {
  amount: BN; // with precision
}

type TokenWithNullableAmount = NullableFields<TokenWithAmount, 'amount'>;

interface TxValidation {
  balance: TokenWithAmount;
  dailyLimit: TokenWithNullableAmount;
  allowance: TokenWithNullableAmount;
  feeTokenBalance: TokenWithAmount;
  fee: TokenWithAmount;
}

export type PayloadPatchFn = (
  value: CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>>
) => CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>> | null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Bridge<B extends BridgeConfig, Origin extends ChainConfig, Target extends ChainConfig>
  extends BridgeBase<B, Origin, Target> {
  claim?(record: HelixHistoryRecord): Observable<Tx>;
  refund?(record: HelixHistoryRecord): Observable<Tx>;
  getDailyLimit?(
    direction: CrossChainPureDirection<TokenInfoWithMeta<Origin | Target>, TokenInfoWithMeta<Origin | Target>>
  ): Promise<DailyLimit>;
  getMinimumFeeTokenHolding?(direction: CrossChainPureDirection): TokenWithAmount | null;
  getAllowancePayload?(direction: CrossChainPureDirection): Promise<AllowancePayload | null>;
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
    const amount = new BN(toWei(from));
    const { balance: originBalance, allowance, dailyLimit, fee, feeTokenBalance } = options;
    const minAmount = this.getMinimumFeeTokenHolding && this.getMinimumFeeTokenHolding(payload.direction);
    const availableBalance =
      minAmount && minAmount.symbol === originBalance.symbol
        ? originBalance.amount.sub(minAmount.amount)
        : originBalance.amount;
    const isBalanceEnough = () => {
      if (originBalance.symbol === fee.symbol) {
        return availableBalance.gte(amount.add(fee.amount));
      } else {
        return availableBalance.gte(amount);
      }
    };

    const xcm = isXCM(from.host, to.host);
    const cBridge = isCBridge(from.host, to.host);

    const validations = [
      // validate empty value
      [originBalance.amount.gt(BN_ZERO), 'Insufficient balance'],
      [!minAmount || minAmount.amount.gt(BN_ZERO), 'Minimum fee token setting error'],
      [availableBalance.gt(BN_ZERO), 'Insufficient available balance'],
      [!!fee && fee.amount.gte(BN_ZERO), 'Failed to get fee'],
      [!!feeTokenBalance && feeTokenBalance.amount.gt(BN_ZERO), 'Insufficient fee balance'],
      [!!from.amount && +from.amount > 0, 'Transfer amount is required'],
      [!!to.amount && +to.amount >= 0, 'Transfer amount invalid'],
      [!this.getAllowancePayload || (allowance.amount && allowance.amount.gt(BN_ZERO)), 'Failed to get allowance'],
      [
        !this.getAllowancePayload || from.type === 'native' || (allowance.amount && allowance.amount.gt(BN_ZERO)),
        'Failed to get allowance',
      ],
      [!this.getDailyLimit || (dailyLimit.amount && dailyLimit.amount.gt(BN_ZERO)), 'Failed to get daily limit'],
      // validate logic
      [xcm || cBridge ? availableBalance.gte(amount) : isBalanceEnough(), 'Insufficient balance'],
      [feeTokenBalance.amount.gte(fee.amount), 'Insufficient balance to pay fee'],
      [!allowance.amount || allowance.amount.gte(amount), 'Insufficient allowance'],
      [
        !dailyLimit.amount || new BN(toWei({ value: fromWei(dailyLimit), decimals: from.decimals })).gte(amount),
        'Insufficient daily limit',
      ], // keep decimals consistent
      [!xcm || Number.isInteger(+from.amount), 'Transfer Amount must be integer'],
    ];
    const result = validations.find((item) => !item[0]);

    return of(result && result[1]).pipe(
      switchMap((res) => {
        if (isString(res)) {
          return throwError(() => ({ error: new Error(res), status: 'error' } as Pick<Tx, 'error' | 'status'>));
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
