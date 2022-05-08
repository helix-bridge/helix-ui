import { Col, Form, Input, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { isEqual, omit } from 'lodash';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { emptyObsFactory } from 'shared/utils';
import { useAccount, useApi } from '../providers';
import { BridgeSelector } from './form-control/BridgeSelector';
import { calcToAmount, Direction } from './form-control/Direction';
import { FromItemButton } from './widget/SubmitButton';

const isDirectionChanged = (pre: CrossChainDirection, cur: CrossChainDirection) => {
  return !isEqual(
    { from: omit(pre.from, 'amount'), to: omit(pre.to, 'amount') },
    { from: omit(cur.from, 'amount'), to: omit(cur.to, 'amount') }
  );
};

export function CrossChain({ dir }: { dir: CrossChainDirection }) {
  const { i18n, t } = useTranslation();
  const [form] = useForm<CrossChainPayload>();
  const { connectNetwork, mainConnection, setNetwork } = useApi();
  const [direction, setDirection] = useState(dir);
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [submitFn, setSubmit] = useState<SubmitFn>(emptyObsFactory);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const [fee, setFee] = useState<number | null>(null);
  const { account } = useAccount();

  const launch = useCallback(() => {
    form.validateFields().then((values) => submitFn(values));
    // void submitFn;
    // form.validateFields().then(console.log);
  }, [form, submitFn]);

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
    setNetwork(direction.from.meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              initial={direction}
              onChange={(value) => {
                if (isDirectionChanged(direction, value)) {
                  setBridge(null);
                  setFee(null);
                  setSubmit(emptyObsFactory);
                  form.setFieldsValue({ [FORM_CONTROL.bridge]: undefined });
                }

                setDirection(value);
                setNetwork(value.from.meta);
              }}
            />
          </Form.Item>

          {bridge && Content && (
            <Content
              form={form}
              bridge={bridge}
              direction={direction}
              setSubmit={setSubmit}
              setBridgeState={setBridgeState}
              onFeeChange={(value) => {
                const { from, to } = direction;

                form.setFieldsValue({
                  [FORM_CONTROL.direction]: { from, to: { ...to, amount: calcToAmount(from.amount, value) } },
                });
                setFee(value);
              }}
            />
          )}

          <Form.Item name={FORM_CONTROL.sender} className="hidden">
            <Input value={account} />
          </Form.Item>

          <Tooltip title={bridgeState.reason} placement="bottom">
            {mainConnection.status === ConnectionStatus.success ? (
              <FromItemButton onClick={() => launch()}>{t('Transfer')}</FromItemButton>
            ) : (
              <FromItemButton
                onClick={() => connectNetwork(direction.from.meta)}
                disabled={mainConnection.status === ConnectionStatus.connecting}
              >
                {t('Connect to Wallet')}
              </FromItemButton>
            )}
          </Tooltip>
        </Col>

        <Col xs={24} sm={{ span: 15, offset: 1 }}>
          <Form.Item name={FORM_CONTROL.bridge} rules={[{ required: true }]}>
            <BridgeSelector
              direction={direction}
              onChange={(value) => {
                setBridge(value || null);
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
