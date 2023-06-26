import { InfoCircleOutlined, WarningFilled } from '@ant-design/icons';
import { BN, BN_ZERO } from '@polkadot/util';
import { Form, Input, message, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import flow from 'lodash/flow';
import identity from 'lodash/identity';
import isEqual from 'lodash/isEqual';
import { BigNumber, utils } from 'ethers';
import omit from 'lodash/omit';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, mergeMap } from 'rxjs';
import { useManualQuery } from 'graphql-hooks';
import { from, from as fromRx } from 'rxjs/internal/observable/from';
import { iif } from 'rxjs/internal/observable/iif';
import { of } from 'rxjs/internal/observable/of';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { DEFAULT_DIRECTION, FORM_CONTROL, LONG_DURATION } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import { getBridges } from 'utils/bridge';
import { BridgeBase } from 'shared/core/bridge';
import { ChainBase } from 'shared/core/chain';
import { useIsMounted } from 'shared/hooks';
import {
  BridgeConfig,
  ChainConfig,
  ConnectionStatus,
  CrossChainDirection,
  CrossChainPureDirection,
  DailyLimit,
  Network,
  ContractConfig,
  SupportedWallet,
  TokenInfoWithMeta,
} from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei, truncate } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { isValidAddress } from 'shared/utils/helper/validator';
import { isEthereumNetwork } from 'shared/utils/network/network';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { Bridge, PayloadPatchFn, TokenWithAmount } from '../core/bridge';
import { useAllowance } from '../hooks/allowance';
import { useCheckSpecVersion } from '../hooks/checkSpecVersion';
import { useAfterTx } from '../hooks/tx';
import { CrossChainComponentProps } from '../model/component';
import { CrossChainPayload } from '../model/tx';
import { useAccount, useApi, useTx, useWallet } from '../providers';
import { isCBridge, isXCM, isLpBridge } from '../utils';
import { getDisplayName } from '../utils/network';
import { bridgeFactory } from '../bridges/bridges';
import { GET_RELAYERS_INFO } from '../config/gql';
import { BridgeSelector } from './form-control/BridgeSelector';
import { calcMax, Direction, toDirection } from './form-control/Direction';
import { TransferConfirm } from './tx/TransferConfirm';
import { TransferDone } from './tx/TransferDone';
import { Connecting } from './widget/Connecting';
import { FormItemButton } from './widget/FormItemButton';

const isDirectionChanged = (pre: CrossChainDirection, cur: CrossChainDirection) => {
  return !isEqual(
    { from: omit(pre.from, 'amount'), to: omit(pre.to, 'amount') },
    { from: omit(cur.from, 'amount'), to: omit(cur.to, 'amount') }
  );
};

type CommonBridge = Bridge<BridgeConfig, ChainConfig, ChainConfig>;

const defaultDirection = { from: toDirection(DEFAULT_DIRECTION.from)!, to: toDirection(DEFAULT_DIRECTION.to)! };

// eslint-disable-next-line complexity
export function CrossChain() {
  const { i18n, t } = useTranslation();
  const [form] = useForm<CrossChainPayload<CommonBridge>>();
  const { connectAndUpdateDepartureNetwork, departureConnection, setDeparture, isConnecting } = useApi();
  const [direction, setDirection] = useState(defaultDirection);
  const [pureDirection, setPureDirection] =
    useState<CrossChainPureDirection<TokenInfoWithMeta<ChainBase>, TokenInfoWithMeta<ChainBase>>>(defaultDirection);
  const [bridge, setBridge] = useState<CommonBridge | null>(null);
  const [bridgeSize, setBridgeSize] = useState<number>(0);
  const [patchPayload, setPatchPayload] = useState<PayloadPatchFn>(() => (v: CrossChainPayload<CommonBridge>) => v);
  const bridgeState = useCheckSpecVersion(direction);
  const [fee, setFee] = useState<TokenWithAmount | null>(null);
  const { account } = useAccount();
  const [balances, setBalances] = useState<BN[] | null>(null);
  const { allowance, approve, queryAllowance, resetAllowance } = useAllowance(direction);
  const { matched } = useWallet();
  const { observer } = useTx();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const isMounted = useIsMounted();
  const router = useRouter();
  const { afterCrossChain } = useAfterTx<CrossChainPayload<Bridge<BridgeConfig, ChainConfig, ChainConfig>>>(router);
  const [fetchRelayersInfo] = useManualQuery(GET_RELAYERS_INFO);

  const allowanceEnough = useMemo(
    () =>
      !bridge?.getAllowancePayload ||
      direction.from.type === 'native' ||
      (allowance && allowance.gt(new BN(toWei(direction.from)))),
    [allowance, bridge?.getAllowancePayload, direction.from]
  );

  // eslint-disable-next-line complexity
  const Content = useMemo(() => {
    const { from: dep, to } = pureDirection;

    if (bridge) {
      const [name, alias] = bridge.isIssue(dep.meta, to.meta)
        ? [bridge.IssueComponentName, bridge.IssueComponentAlias]
        : [bridge.RedeemComponentName, bridge.RedeemComponentAlias];

      let nameWithSuffix = name;
      if (bridge.category === 'helixLpBridge') {
        nameWithSuffix = name + 'Ln';
      } else if (bridge.category === 'l1tol2') {
        nameWithSuffix = name + 'L2';
      } else if (bridge.category === 'LnBridge') {
        nameWithSuffix = name + 'LnBridge';
      }

      return (
        dynamic<CrossChainComponentProps<BridgeBase>>(() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          import('../bridges').then((res) => (res as any)[nameWithSuffix] || (res as any)[alias])
        ) ?? null
      );
    }

    return null;
  }, [bridge, pureDirection]);

  useEffect(() => {
    setDeparture(direction.from.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const configs = getBridges(direction);
    setBridgeSize(configs.length);
  }, [direction]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.sender]: account });
  }, [account, form]);

  useEffect(() => {
    let sub$$ = EMPTY.subscribe();

    if (!!account && !!pureDirection.from && isValidAddress(account, pureDirection.from.host)) {
      setIsBalanceLoading(true);
      setBalances(null);

      const { from: dep } = pureDirection;

      const obs = of(null).pipe(
        switchMap(() => fromRx(dep.meta.getBalance(pureDirection, account))),
        pollWhile(LONG_DURATION, () => isMounted)
      );

      sub$$ = obs.subscribe({
        next(result) {
          setBalances(result);
          setIsBalanceLoading(false);
        },
        error() {
          setIsBalanceLoading(false);
        },
        complete() {
          setIsBalanceLoading(false);
        },
      });
    }

    return () => sub$$.unsubscribe();
  }, [account, bridge, isMounted, pureDirection]);

  useEffect(() => {
    if (
      bridge &&
      bridge.getAllowancePayload &&
      isEthereumNetwork(pureDirection.from.host) &&
      pureDirection.from.type !== 'native'
    ) {
      bridge.getAllowancePayload(pureDirection).then((payload) => {
        if (payload) {
          queryAllowance(payload);
        }
      });
    } else {
      resetAllowance();
    }
  }, [bridge, pureDirection, queryAllowance, resetAllowance]);

  useEffect(() => {
    if (!bridge) {
      setFee(null);
      return;
    }

    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(bridge.getFee(direction, account))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe((res) => {
        setFee((pre) => (pre?.amount.toString() === res?.amount.toString() && pre?.symbol === res?.symbol ? pre : res));
      });

    return () => sub$$?.unsubscribe();
  }, [account, bridge, direction, isMounted, setFee]);

  useEffect(() => {
    if (!bridge?.getDailyLimit) {
      setDailyLimit(null);
      return;
    }

    const sub$$ = of(null)
      .pipe(
        switchMap(() => from(bridge.getDailyLimit!(pureDirection))),
        pollWhile(LONG_DURATION, () => isMounted)
      )
      .subscribe((res) => {
        setDailyLimit((pre) => (isEqual(pre, res) ? pre : res));
      });

    return () => sub$$?.unsubscribe();
  }, [bridge, pureDirection, isMounted]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      const _from = toDirection({
        host: params.get('from_host') as Network,
        symbol: (params.get('from_token') || '') as string,
      });
      const _to = toDirection({
        host: params.get('to_host') as Network,
        symbol: (params.get('to_token') || '') as string,
      });

      setDirection((prev) => {
        const d = { from: _from ?? prev.from, to: _to ?? prev.to };
        form.setFieldsValue({ [FORM_CONTROL.direction]: d });
        return d;
      });
      setPureDirection((prev) => ({ from: _from ?? prev.from, to: _to ?? prev.to }));
    } catch (err) {
      // console.error(err);
    }
  }, [form]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('bridge')) {
      const configs = getBridges(direction);
      const b: Bridge<BridgeConfig<ContractConfig>, ChainConfig, ChainConfig> | undefined = configs
        .map((config) => bridgeFactory(config))
        .find((item) => item.category === params.get('bridge'));
      if (b) {
        form.setFieldValue([FORM_CONTROL.bridge], b);
        setBridge(b);
      }
    }
  }, [form, direction]);

  return (
    <Form
      layout="vertical"
      form={form}
      validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
      className="mb-4 sm:mb-0 bg-antDark p-5 mx-auto lg:w-1/2 w-full"
    >
      <Form.Item
        name={FORM_CONTROL.direction}
        className="mb-0"
        validateFirst
        rules={[
          {
            // eslint-disable-next-line complexity
            validator(_, val: CrossChainDirection) {
              if (!bridge || !balances) {
                return Promise.resolve();
              }

              const balance = balances[0];
              const mini = bridge && bridge.getMinimumFeeTokenHolding && bridge.getMinimumFeeTokenHolding(val);
              const max = calcMax(
                { ...val.from, amount: balance },
                isCBridge(direction) || isXCM(direction) ? null : fee,
                mini ?? undefined
              );
              return !max || new BN(toWei({ value: max })).gte(new BN(toWei({ value: val.from.amount })))
                ? Promise.resolve()
                : Promise.reject(`Max available balance is ${max}`);
            },
          },
          {
            validator(_, val: CrossChainDirection) {
              const {
                from: { amount, decimals },
              } = val;

              if (!amount) {
                return Promise.resolve();
              }

              const decimalCount = amount.toString().split('.')[1]?.length;

              if (decimalCount && decimalCount > decimals) {
                return Promise.reject(
                  `Maximum number of digits is ${decimals}, excess digits will be ignored. Your input ${amount} will be treat as ${truncate(
                    amount,
                    decimals
                  )}`
                );
              } else {
                return Promise.resolve();
              }
            },
          },
          {
            validator(_, val: CrossChainDirection) {
              if (bridge && bridge.validateDirection) {
                const rules = bridge.validateDirection(val);
                const result = rules.find((item) => !item[0]);

                if (result && !result[0]) {
                  return Promise.reject(result[1]);
                }
              }

              return Promise.resolve();
            },
          },
          {
            validator(_, val: CrossChainDirection) {
              if (bridge && bridge.category === 'XCM' && fee) {
                return fee.amount.gte(new BN(toWei({ value: val.from.amount, decimals: fee.decimals })))
                  ? Promise.reject('Transfer amount invalid')
                  : Promise.resolve();
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <Direction
          fee={fee}
          bridge={bridge}
          balances={balances}
          isBalanceLoading={isBalanceLoading}
          onRefresh={() => {
            setIsBalanceLoading(true);
            setBalances(null);

            fromRx(direction.from.meta.getBalance(direction, account)).subscribe({
              next(result) {
                setBalances(result);
              },
              complete() {
                setIsBalanceLoading(false);
              },
            });
          }}
          onChange={(value) => {
            if (isDirectionChanged(direction, value)) {
              setBridge(null);
              setBridgeSize(0);
              setPatchPayload(() => identity);
              form.setFieldsValue({ [FORM_CONTROL.bridge]: undefined, [FORM_CONTROL.recipient]: undefined });
              setPureDirection({ from: omit(value.from, 'amount'), to: omit(value.to, 'amount') });
              setFee(null);
            }

            setDirection(value);
            setDeparture(value.from.meta);
          }}
        />
      </Form.Item>

      <Form.Item
        name={FORM_CONTROL.bridge}
        rules={[
          {
            validator(_r, value: unknown) {
              if (!value) {
                message.error(t('Please select a bridge first!'));
                return Promise.reject();
              }

              return Promise.resolve();
            },
          },
        ]}
        className={bridgeSize < 2 ? 'mb-0 hidden' : undefined}
      >
        <BridgeSelector
          direction={direction}
          onChange={(value) => {
            const isSameBridge =
              Object.getPrototypeOf(value).constructor.alias === Object.getPrototypeOf(bridge ?? {}).constructor.alias;

            if (!isSameBridge) {
              setBridge(value || null);
              setDailyLimit(null);
              setFee(null);
            }
          }}
        />
      </Form.Item>

      {bridge && Content && (
        <Content
          form={form}
          bridge={bridge}
          direction={direction}
          balances={balances}
          allowance={allowance}
          fee={fee}
          dailyLimit={dailyLimit}
          updatePayload={setPatchPayload}
        />
      )}

      <Form.Item name={FORM_CONTROL.sender} className="hidden">
        <Input value={account} />
      </Form.Item>

      {!allowanceEnough && account && !isBalanceLoading ? (
        matched ? (
          <FormItemButton
            onClick={() => {
              if (bridge?.getAllowancePayload) {
                bridge.getAllowancePayload(direction).then((payload) => {
                  if (payload) {
                    isMetamaskChainConsistent(direction.from.meta).subscribe((is) => {
                      if (is) {
                        approve(payload);
                      }
                    });
                  }
                });
              }
            }}
            className="cy-approve"
          >
            {t('Approve')}
          </FormItemButton>
        ) : (
          <FormItemButton disabled={isConnecting} onClick={() => connectAndUpdateDepartureNetwork(direction.from.meta)}>
            {isConnecting ? <Connecting /> : t('Switch to {{chain}}', { chain: getDisplayName(direction.from.meta) })}
          </FormItemButton>
        )
      ) : departureConnection.status === ConnectionStatus.success ? (
        matched ? (
          <>
            {bridgeState.status === 'error' && (
              <div className="w-full flex items-center gap-4 p-4 bg-white border text-gray-900 rounded-sm">
                <WarningFilled className="text-yellow-400 text-xl" />
                <span className="mr-2">{t('The system is under maintenance, please try again later')}</span>
                <Tooltip title={bridgeState.reason}>
                  <InfoCircleOutlined />
                </Tooltip>
              </div>
            )}

            <FormItemButton
              disabled={bridgeState.status !== 'available' || bridge == null || isBalanceLoading || fee == null}
              onClick={() => {
                if (!matched) {
                  message.error('Wrong Network');
                  return;
                }

                // eslint-disable-next-line complexity
                form.validateFields().then(async (values) => {
                  const payload = await flow(
                    patchPayload,
                    (value: CrossChainPayload<CommonBridge> | null) =>
                      value && { ...value, wallet: departureConnection.wallet as SupportedWallet },
                    async (value) => {
                      if (value?.bridge.category === 'LnBridge') {
                        try {
                          const { data: relayersInfo } = await fetchRelayersInfo({
                            variables: {
                              amount: utils
                                .parseUnits(value.direction.from.amount.toString(), value.direction.from.decimals)
                                .toNumber(),
                              decimals: 1000000000000000000, // TODO
                            },
                          });

                          if (relayersInfo?.sortedLnv20RelayInfos.length) {
                            return {
                              ...value,
                              providerKey: Number(relayersInfo.sortedLnv20RelayInfos[0].providerKey),
                              depositedMargin: BigNumber.from(relayersInfo.sortedLnv20RelayInfos[0].margin),
                            };
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      return value;
                    }
                  )(values);

                  if (!payload) {
                    return;
                  }

                  const fromToken = omit(direction.from, 'meta');
                  const toToken = omit(direction.to, 'meta');
                  const [balance, nativeTokenBalance] = balances ?? [BN_ZERO, BN_ZERO];
                  const feeIsErc20Token = isXCM(direction) || isCBridge(direction) || isLpBridge(direction);

                  const validateObs = payload.bridge.validate(payload, {
                    balance: { ...fromToken, amount: balance },
                    fee: fee!,
                    feeTokenBalance: {
                      ...fee,
                      amount: feeIsErc20Token ? balance : nativeTokenBalance,
                    } as TokenWithAmount,
                    dailyLimit: {
                      ...toToken,
                      amount: dailyLimit && new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday)),
                    },
                    allowance: { ...fromToken, amount: allowance },
                  });

                  const workflow = createTxWorkflow(
                    validateObs.pipe(
                      mergeMap(() =>
                        applyModalObs({
                          content: <TransferConfirm value={payload} fee={fee!} />,
                          closable: false,
                          title: t('Confirm To Continue'),
                        })
                      )
                    ),
                    () => {
                      return payload.bridge.send(payload, fee?.amount);
                    },
                    afterCrossChain(TransferDone, { payload })
                  );

                  workflow.subscribe({
                    ...observer,
                    complete() {
                      observer.complete();
                      setIsBalanceLoading(true);

                      iif(() => !!account, fromRx(direction.from.meta.getBalance(direction, account)), EMPTY).subscribe(
                        (result) => {
                          setBalances(result);
                          setIsBalanceLoading(false);
                        }
                      );
                    },
                  });
                });
              }}
              className="cy-submit"
            >
              {t('Transfer')}
            </FormItemButton>
          </>
        ) : (
          <FormItemButton disabled={isConnecting} onClick={() => connectAndUpdateDepartureNetwork(direction.from.meta)}>
            {isConnecting ? <Connecting /> : t('Switch to {{chain}}', { chain: getDisplayName(direction.from.meta) })}
          </FormItemButton>
        )
      ) : (
        <FormItemButton onClick={() => connectAndUpdateDepartureNetwork(direction.from.meta)} disabled={isConnecting}>
          {isConnecting ? <Connecting /> : t('Connect to Wallet')}
        </FormItemButton>
      )}
    </Form>
  );
}
