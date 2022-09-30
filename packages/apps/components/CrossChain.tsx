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
import { from as fromRx } from 'rxjs/internal/observable/from';
import { iif } from 'rxjs/internal/observable/iif';
import { of } from 'rxjs/internal/observable/of';
import { FORM_CONTROL } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import {
  BridgeBase,
  BridgeState,
  ConnectionStatus,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainPayload,
  TokenInfoWithMeta,
  TxObservableFactory,
} from 'shared/model';
import { truncate } from 'shared/utils/helper/balance';
import { isKton } from 'shared/utils/helper/validator';
import { AllowancePayload, useAllowance } from '../hooks/allowance';
import { useAccount, useApi, useTx, useWallet } from '../providers';
import { getBalance } from '../utils';
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
export function CrossChain({ dir }: { dir: CrossChainDirection }) {
  const { i18n, t } = useTranslation();
  const [form] = useForm<CrossChainPayload>();
  const { connectDepartureNetwork, departureConnection, setDeparture } = useApi();
  const [direction, setDirection] = useState(dir);
  const [pureDirection, setPureDirection] = useState<CrossChainDirection<TokenInfoWithMeta, TokenInfoWithMeta>>(dir);
  const [bridge, setBridge] = useState<BridgeBase | null>(null);
  const [createTxObservable, setTxObservableFactory] = useState<TxObservableFactory>(() => EMPTY);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const [fee, setFee] = useState<{ amount: number; symbol: string } | null>(null);
  const { account } = useAccount();
  const [balances, setBalances] = useState<BN[] | null>(null);
  const { allowance, approve, queryAllowance } = useAllowance(direction);
  const [allowancePayload, setAllowancePayload] = useState<AllowancePayload | null>(null);
  const { matched } = useWallet();
  const { observer } = useTx();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const allowanceEnough = useMemo(() => {
    if (!allowance || !balances) {
      return false;
    }

    if (Array.isArray(balances)) {
      return allowance.gt(balances[isKton(direction.from.symbol) ? 1 : 0]);
    }

    return allowance.gt(balances);
  }, [allowance, balances, direction.from.symbol]);

  const Content = useMemo(() => {
    const { from, to } = pureDirection;

    if (bridge) {
      const comp = bridge.isIssue(from.meta, to.meta)
        ? bridge.IssueCrossChainComponent
        : bridge.RedeemCrossChainComponent;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return dynamic<CrossChainComponentProps>(() => import('../bridges').then((res) => (res as any)[comp])) ?? null;
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
    const sub$$ = iif(() => !!account, fromRx(getBalance(pureDirection, account)), of(null)).subscribe((result) => {
      setBalances(result);
      setIsBalanceLoading(false);
    });

    return () => sub$$.unsubscribe();
  }, [account, pureDirection]);

  useEffect(() => {
    if (allowancePayload) {
      queryAllowance(allowancePayload);
    }
  }, [allowancePayload, queryAllowance]);

  return (
    <Form
      name={FORM_CONTROL.direction}
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

                fromRx(getBalance(direction, account)).subscribe((result) => {
                  setBalances(result);
                  setIsBalanceLoading(false);
                });
              }}
              onChange={(value) => {
                if (isDirectionChanged(direction, value)) {
                  setBridge(null);
                  setFee(null);
                  setAllowancePayload(null);
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
              setTxObservableFactory={setTxObservableFactory}
              setBridgeState={setBridgeState}
              onFeeChange={setFee}
              updateAllowancePayload={setAllowancePayload}
            />
          )}

          <Form.Item name={FORM_CONTROL.sender} className="hidden">
            <Input value={account} />
          </Form.Item>

          {!allowanceEnough && allowancePayload && account ? (
            <FormItemButton onClick={() => approve(allowancePayload)} className="cy-approve">
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

                        iif(() => !!account, fromRx(getBalance(direction, account)), of(null)).subscribe((result) => {
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
