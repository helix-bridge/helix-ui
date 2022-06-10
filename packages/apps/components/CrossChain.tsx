import { InfoCircleOutlined, WarningFilled } from '@ant-design/icons';
import { Col, Form, Input, message, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import BN from 'bn.js';
import { isEqual, omit } from 'lodash';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from as fromRx, iif, of, tap } from 'rxjs';
import { FORM_CONTROL } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import {
  Bridge,
  BridgeState,
  ConnectionStatus,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainPayload,
  TxObservableFactory,
} from 'shared/model';
import { isRing } from 'shared/utils/helper';
import { useAllowance } from '../hooks/allowance';
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
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [createTxObservable, setTxObservableFactory] = useState<TxObservableFactory>(() => EMPTY);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const [fee, setFee] = useState<{ amount: number; symbol: string } | null>(null);
  const { account } = useAccount();
  const [balance, setBalance] = useState<BN | BN[] | null>(null);
  const { allowance, approve, queryAllowance } = useAllowance(direction);
  const [allowancePayload, setAllowancePayload] = useState<{ spender: string; tokenAddress: string } | null>(null);
  const { matched } = useWallet();
  const { observer } = useTx();
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const allowanceEnough = useMemo(() => {
    if (!allowance || !balance) {
      return false;
    }

    if (Array.isArray(balance)) {
      return isRing(direction.from.symbol) ? allowance.gt(balance[0]) : true;
    }

    return allowance.gt(balance);
  }, [allowance, balance, direction.from.symbol]);

  const launch = useCallback(() => {
    form.validateFields().then((values) => {
      if (!values.direction.from.amount) {
        message.error(t('Transfer amount is required'));
      } else {
        createTxObservable(values).subscribe({
          ...observer,
          complete() {
            observer.complete();

            iif(
              () => !!account && matched,
              fromRx(getBalance(direction, account)).pipe(tap(() => setIsBalanceLoading(true))),
              of(null)
            ).subscribe((result) => {
              setBalance(result);
              setIsBalanceLoading(false);
            });
          },
        });
      }
    });
  }, [form, t, createTxObservable, observer, direction, account, matched]);

  const Content = useMemo(() => {
    const { from, to } = direction;

    if (bridge) {
      const Comp = bridge.isIssuing(from.meta, to.meta)
        ? bridge.IssuingCrossChainComponent
        : (bridge.RedeemCrossChainComponent as FunctionComponent<CrossChainComponentProps>);

      return Comp ?? null;
    }

    return null;
  }, [bridge, direction]);

  useEffect(() => {
    setDeparture(direction.from.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.sender]: account });
  }, [account, form]);

  useEffect(() => {
    const sub$$ = iif(
      () => !!account && matched,
      fromRx(getBalance(direction, account)).pipe(tap(() => setIsBalanceLoading(true))),
      of(null)
    ).subscribe((result) => {
      console.log('💰 ~ balances', Array.isArray(result) ? result.map((item) => item.toString()) : result?.toString());
      setBalance(result);
      setIsBalanceLoading(false);
    });

    return () => sub$$.unsubscribe();
  }, [account, direction, matched]);

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
        <Col xs={24} sm={8} className={`mb-4 sm:mb-0 dark:bg-antDark p-5`}>
          <Form.Item name={FORM_CONTROL.direction} className="mb-0">
            <Direction
              fee={fee}
              balance={balance}
              isBalanceLoading={isBalanceLoading}
              initial={direction}
              onChange={(value) => {
                if (isDirectionChanged(direction, value)) {
                  setBridge(null);
                  setFee(null);
                  setAllowancePayload(null);
                  setTxObservableFactory(() => EMPTY);
                  setBridgeState({ status: 'available' });
                  form.setFieldsValue({ [FORM_CONTROL.bridge]: undefined, [FORM_CONTROL.recipient]: undefined });
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
              balance={balance}
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
              {bridgeState.status !== 'available' && (
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
                onClick={() => launch()}
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

        <Col xs={24} sm={{ span: 15, offset: 1 }} className="dark:bg-antDark">
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
