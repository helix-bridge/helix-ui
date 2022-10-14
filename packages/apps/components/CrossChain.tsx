import { InfoCircleOutlined, WarningFilled } from '@ant-design/icons';
import { Col, Form, Input, message, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import BN from 'bn.js';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from, from as fromRx } from 'rxjs/internal/observable/from';
import { iif } from 'rxjs/internal/observable/iif';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/internal/operators/map';
import { FORM_CONTROL, LONG_DURATION } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import { BridgeBase } from 'shared/core/bridge';
import { ChainBase } from 'shared/core/chain';
import { useIsMounted } from 'shared/hooks';
import {
  BridgeConfig,
  BridgeState,
  ChainConfig,
  ConnectionStatus,
  CrossChainDirection,
  CrossToken,
  TokenInfoWithMeta,
} from 'shared/model';
import { fromWei, toWei, truncate } from 'shared/utils/helper/balance';
import { pollWhile } from 'shared/utils/helper/operator';
import { isEthereumNetwork } from 'shared/utils/network/network';
import { Bridge, TokenWithAmount } from '../core/bridge';
import { useAllowance } from '../hooks/allowance';
import { CrossChainComponentProps } from '../model/component';
import { CrossChainPayload, TxObservableFactory } from '../model/tx';
import { useAccount, useApi, useTx, useWallet } from '../providers';
import { BridgeSelector } from './form-control/BridgeSelector';
import { Direction } from './form-control/Direction';
import { FormItemButton } from './widget/FormItemButton';

const isDirectionChanged = (pre: CrossChainDirection, cur: CrossChainDirection) => {
  return !isEqual(
    { from: omit(pre.from, 'amount'), to: omit(pre.to, 'amount') },
    { from: omit(cur.from, 'amount'), to: omit(cur.to, 'amount') }
  );
};

// eslint-disable-next-line complexity
export function CrossChain({ dir }: { dir: CrossChainDirection<CrossToken<ChainBase>, CrossToken<ChainBase>> }) {
  const { i18n, t } = useTranslation();
  const [form] = useForm<CrossChainPayload>();
  const { connectDepartureNetwork, departureConnection, setDeparture } = useApi();
  const [direction, setDirection] = useState(dir);
  const [pureDirection, setPureDirection] =
    useState<CrossChainDirection<TokenInfoWithMeta<ChainBase>, TokenInfoWithMeta<ChainBase>>>(dir);
  const [bridge, setBridge] = useState<Bridge<BridgeConfig, ChainConfig, ChainConfig> | null>(null);
  const [createTxObservable, setTxObservableFactory] = useState<TxObservableFactory>(() => EMPTY);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const [fee, setFee] = useState<(Omit<TokenWithAmount, 'amount'> & { amount: number }) | null>(null);
  const { account } = useAccount();
  const [balances, setBalances] = useState<BN[] | null>(null);
  const { allowance, approve, queryAllowance } = useAllowance(direction);
  const { matched } = useWallet();
  const { observer } = useTx();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const isMounted = useIsMounted();

  const allowanceEnough = useMemo(() => {
    if (
      !isEthereumNetwork(direction.from.host) ||
      (isEthereumNetwork(direction.from.host) && direction.from.type === 'native')
    ) {
      return true;
    }

    return allowance && allowance.gt(new BN(toWei(direction.from)));
  }, [allowance, direction.from]);

  const Content = useMemo(() => {
    const { from: dep, to } = pureDirection;

    if (bridge) {
      const comp = bridge.isIssue(dep.meta, to.meta)
        ? bridge.IssueCrossChainComponent
        : bridge.RedeemCrossChainComponent;

      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dynamic<CrossChainComponentProps<BridgeBase>>(() => import('../bridges').then((res) => (res as any)[comp])) ??
        null
      );
    }

    return null;
  }, [bridge, pureDirection]);

  useEffect(() => {
    setDeparture(direction.from.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.sender]: account });
  }, [account, form]);

  useEffect(() => {
    setIsBalanceLoading(true);
    const { from: dep } = pureDirection;
    const sub$$ = iif(
      () => !!account && !!dep,
      fromRx(dep.meta.getBalance(pureDirection, account)),
      of(null)
    ).subscribe((result) => {
      setBalances(result);
      setIsBalanceLoading(false);
    });

    return () => sub$$.unsubscribe();
  }, [account, bridge, pureDirection]);

  useEffect(() => {
    if (
      bridge &&
      bridge.getAllowancePayload &&
      isEthereumNetwork(direction.from.host) &&
      direction.from.type !== 'native'
    ) {
      bridge.getAllowancePayload(direction).then((payload) => {
        queryAllowance(payload);
      });
    }
  }, [bridge, direction, queryAllowance]);

  useEffect(() => {
    const obs = bridge?.getFee
      ? from(bridge.getFee(direction, account)).pipe(map((res) => res && { ...res, amount: +fromWei(res) }))
      : of(null);

    const sub$$ = obs.pipe(pollWhile(LONG_DURATION, () => isMounted)).subscribe((res) => setFee(res));

    return () => sub$$.unsubscribe();
  }, [account, bridge, direction, isMounted, setFee]);

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{ direction }}
      validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
    >
      <Row>
        <Col xs={24} sm={8} className={`mb-4 sm:mb-0 bg-antDark p-5`}>
          <Form.Item
            name={FORM_CONTROL.direction}
            className="mb-0"
            rules={[
              {
                validator: (_, val: CrossChainDirection) => {
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
            ]}
          >
            <Direction
              fee={fee}
              balances={balances}
              isBalanceLoading={isBalanceLoading}
              initial={direction}
              onRefresh={() => {
                setIsBalanceLoading(true);

                fromRx(direction.from.meta.getBalance(direction, account)).subscribe((result) => {
                  setBalances(result);
                  setIsBalanceLoading(false);
                });
              }}
              onChange={(value) => {
                if (isDirectionChanged(direction, value)) {
                  setBridge(null);
                  setTxObservableFactory(() => EMPTY);
                  setBridgeState({ status: 'available' });
                  form.setFieldsValue({ [FORM_CONTROL.bridge]: undefined, [FORM_CONTROL.recipient]: undefined });
                  setPureDirection({ from: omit(value.from, 'amount'), to: omit(value.to, 'amount') });
                }

                setDirection(value);
                setDeparture(value.from.meta);
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
              setTxObservableFactory={setTxObservableFactory}
              setBridgeState={setBridgeState}
            />
          )}

          <Form.Item name={FORM_CONTROL.sender} className="hidden">
            <Input value={account} />
          </Form.Item>

          {!allowanceEnough && account ? (
            <FormItemButton
              onClick={() => {
                if (bridge?.getAllowancePayload) {
                  bridge.getAllowancePayload(direction).then((payload) => approve(payload));
                }
              }}
              className="cy-approve"
            >
              {t('Approve')}
            </FormItemButton>
          ) : departureConnection.status === ConnectionStatus.success ? (
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
                disabled={bridgeState.status !== 'available'}
                onClick={() => {
                  if (!matched) {
                    message.error('Wrong Network');
                    return;
                  }

                  form.validateFields().then((values) => {
                    if (!values.direction.from.amount) {
                      message.error(t('Transfer amount is required'));
                      return;
                    }

                    if (!values.direction.to.amount) {
                      message.error(t('Transfer amount invalid'));
                      return;
                    }

                    createTxObservable(values).subscribe({
                      ...observer,
                      complete() {
                        observer.complete();
                        setIsBalanceLoading(true);

                        iif(
                          () => !!account,
                          fromRx(direction.from.meta.getBalance(direction, account)),
                          of(null)
                        ).subscribe((result) => {
                          setBalances(result);
                          setIsBalanceLoading(false);
                        });
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
            <FormItemButton
              onClick={() => connectDepartureNetwork(direction.from.meta)}
              disabled={departureConnection.status === ConnectionStatus.connecting}
            >
              {t('Connect to Wallet')}
            </FormItemButton>
          )}
        </Col>

        <Col xs={24} sm={{ span: 15, offset: 1 }} className="bg-antDark">
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
            className="mb-0"
          >
            <BridgeSelector direction={direction} onChange={(value) => setBridge(value || null)} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
