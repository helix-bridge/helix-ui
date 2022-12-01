import { BN, BN_ZERO } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { isAddress } from 'ethers/lib/utils';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import last from 'lodash/last';
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
  ParachainChainConfig,
  ParachainEthereumCompatibleChainConfig,
  PolkadotExtension,
  Token,
  TokenInfoWithMeta,
  TokenWithBridgesInfo,
  Tx,
} from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm } from 'shared/utils/helper/address';
import { addHelixFlag, fromWei, toWei } from 'shared/utils/helper/balance';
import { signAndSendExtrinsic } from 'shared/utils/tx';
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

type XCMChainConfig = ParachainChainConfig | ParachainEthereumCompatibleChainConfig;

export interface Bridge<B extends BridgeConfig, Origin extends ChainConfig, Target extends ChainConfig>
  extends BridgeBase<B, Origin, Target> {
  claim?(record: HelixHistoryRecord): Observable<Tx>;
  refund?(record: HelixHistoryRecord): Observable<Tx>;
  getDailyLimit?(
    direction: CrossChainPureDirection<TokenInfoWithMeta<Origin | Target>, TokenInfoWithMeta<Origin | Target>>
  ): Promise<DailyLimit>;
  getMinimumFeeTokenHolding?(direction: CrossChainPureDirection): TokenWithAmount | null;
  getAllowancePayload?(direction: CrossChainPureDirection): Promise<AllowancePayload | null>;
  validateDirection?(direction: CrossChainDirection): [boolean, string][];
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

    const xcm = isXCM(payload.direction);
    const cBridge = isCBridge(payload.direction);

    /**
     * [pass condition, error message]
     */
    const validations: [boolean, string][] = [
      // validate empty value
      [originBalance.amount.gt(BN_ZERO), 'Insufficient balance'],
      [!minAmount || minAmount.amount.gt(BN_ZERO), 'Minimum fee token setting error'],
      [availableBalance.gt(BN_ZERO), 'Insufficient available balance'],
      [!!fee && fee.amount.gte(BN_ZERO), 'Failed to get fee'],
      [!!feeTokenBalance && feeTokenBalance.amount.gt(BN_ZERO), 'Insufficient fee balance'],
      [!!from.amount && +from.amount > 0, 'Transfer amount is required'],
      [!!to.amount && +to.amount >= 0, 'Transfer amount invalid'],
      [
        !this.getAllowancePayload || from.type === 'native' || (!!allowance.amount && allowance.amount.gt(BN_ZERO)),
        'Failed to get allowance',
      ],
      [!this.getDailyLimit || (!!dailyLimit.amount && dailyLimit.amount.gte(BN_ZERO)), 'Failed to get daily limit'],
      // validate logic
      [xcm || cBridge ? availableBalance.gte(amount) : isBalanceEnough(), 'Insufficient balance'],
      [feeTokenBalance.amount.gte(fee.amount), 'Insufficient balance to pay fee'],
      [!allowance.amount || allowance.amount.gte(amount), 'Insufficient allowance'],
      [
        !dailyLimit.amount || new BN(toWei({ value: fromWei(dailyLimit), decimals: from.decimals })).gte(amount),
        'Insufficient daily limit',
      ], // keep decimals consistent
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
    key: keyof Pick<HelixHistoryRecord, 'feeToken' | 'sendToken' | 'recvToken'>
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
          return true;
        }
      }

      return isSameSymbol;
    })!;
  }

  protected trimLaneId(id: string) {
    const res = last(id.split('-')) as string;

    return res.substring(10, id.length + 1);
  }

  protected wrapXCMAmount(token: CrossToken<ChainConfig>): string {
    const amount = addHelixFlag(token.amount, token.decimals);

    return toWei({ value: amount, decimals: token.decimals });
  }

  protected xcmReserveTransferAssets(
    payload: CrossChainPayload<
      Bridge<BridgeConfig, XCMChainConfig, XCMChainConfig>,
      CrossToken<XCMChainConfig>,
      CrossToken<XCMChainConfig>,
      PolkadotExtension
    >,
    method = 'reserveTransferAssets'
  ): Observable<Tx> {
    const {
      direction: { from: departure, to: arrival },
      sender,
      recipient,
      wallet,
    } = payload;
    const amount = this.wrapXCMAmount(departure);
    const api = entrance.polkadot.getInstance(departure.meta.provider.wss);

    const dest = api.createType('XcmVersionedMultiLocation', {
      V1: api.createType('XcmV1MultiLocation', {
        parents: 1,
        interior: api.createType('XcmV1MultilocationJunctions', {
          X1: api.createType('XcmV1Junction', {
            Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
          }),
        }),
      }),
    });

    const beneficiary = api.createType('XcmVersionedMultiLocation', {
      V1: api.createType('XcmV1MultiLocation', {
        parents: 0,
        interior: api.createType('XcmV1MultilocationJunctions', {
          X1: api.createType(
            'XcmV1Junction',
            isEthereumAddress(recipient)
              ? {
                  // for ethereum compatible parachain (e.g. moonriver), use this
                  AccountKey20: {
                    network: api.createType('NetworkId', 'Any'),
                    key: recipient,
                  },
                }
              : {
                  // for common parachain, use this
                  AccountId32: {
                    network: api.createType('NetworkId', 'Any'),
                    id: convertToDvm(recipient),
                  },
                }
          ),
        }),
      }),
    });

    const assets = api.createType('XcmVersionedMultiAssets', {
      V1: [
        api.createType('XcmV1MultiAsset', {
          id: api.createType('XcmV1MultiassetAssetId', {
            Concrete: api.createType(
              'XcmV1MultiLocation',
              this.isIssue(departure.host, arrival.host)
                ? {
                    parents: 0,
                    interior: api.createType('XcmV1MultilocationJunctions', 'Here'),
                  }
                : {
                    parents: 1,
                    interior: api.createType('XcmV1MultilocationJunctions', {
                      X1: api.createType('XcmV1Junction', {
                        Parachain: api.createType('Compact<u32>', arrival.meta.paraId),
                      }),
                    }),
                  }
            ),
          }),
          fun: api.createType('XcmV1MultiassetFungibility', {
            Fungible: api.createType('Compact<u128>', amount),
          }),
        }),
      ],
    });

    const feeAssetItem = 0;
    const extrinsic = api.tx.polkadotXcm[method](dest, beneficiary, assets, feeAssetItem);

    return signAndSendExtrinsic(api, sender, extrinsic, wallet);
  }
}
