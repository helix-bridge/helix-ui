import { WarningFilled } from '@ant-design/icons';
import { Col, Form, Input, message, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import BN from 'bn.js';
import { isEqual, omit } from 'lodash';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from as fromRx } from 'rxjs';
import { FORM_CONTROL } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import {
  Bridge,
  BridgeState,
  ConnectionStatus,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainPayload,
  SubmitFn,
} from 'shared/model';
import { emptyObsFactory, isRing } from 'shared/utils/helper';
import { useAllowance } from '../hooks/allowance';
import { useAccount, useApi } from '../providers';
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
  const [submitFn, setSubmit] = useState<SubmitFn>(emptyObsFactory);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const [fee, setFee] = useState<{ amount: number; symbol: string } | null>(null);
  const { account } = useAccount();
  const [balance, setBalance] = useState<BN | BN[] | null>(null);
  const { allowance, approve, queryAllowance } = useAllowance(direction);
  const [allowancePayload, setAllowancePayload] = useState<{ spender: string; tokenAddress: string } | null>(null);

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
      console.log('🚀 ~ cross chain args: ', values);

      if (!values.direction.from.amount) {
        message.error(t('Transfer amount is required'));
      } else {
        submitFn(values);
      }
    });
  }, [form, submitFn, t]);

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
    if (!account) {
      return;
    }

    const sub$$ = fromRx(getBalance(direction, account)).subscribe((result) => {
      console.log('💰 ~ balances', Array.isArray(result) ? result.map((item) => item.toString()) : result?.toString());
      setBalance(result);
    });

    return () => sub$$?.unsubscribe();
  }, [account, direction]);

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
              initial={direction}
              onChange={(value) => {
                if (isDirectionChanged(direction, value)) {
                  setBridge(null);
                  setFee(null);
                  setAllowancePayload(null);
                  setSubmit(emptyObsFactory);
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
              setSubmit={setSubmit}
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
                  <span>{bridgeState.reason}</span>
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
          <Form.Item name={FORM_CONTROL.bridge} rules={[{ required: true }]} className="mb-0">
            <BridgeSelector direction={direction} onChange={(value) => setBridge(value || null)} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
