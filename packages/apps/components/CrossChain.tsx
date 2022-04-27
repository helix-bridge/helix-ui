import { FORM_CONTROL } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import {
  BridgeState,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainParty,
  CrossChainPayload,
  Network,
  NetworkMode,
  NullableCrossChainDirection,
  SubmitFn,
} from 'shared/model';
import {
  emptyObsFactory,
  getBridge,
  getBridgeComponent,
  getInitialSetting,
  isReachable,
  isSameNetConfig,
  verticesToChainConfig,
} from 'shared/utils';
import { Form, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi, useTx } from '../hooks';
import { Direction } from './form-control/Direction';
import { FromItemButton, SubmitButton } from './widget/SubmitButton';

const getCrossChainComponent = getBridgeComponent('crossChain');

// eslint-disable-next-line complexity
const getDirectionFromSettings: () => NullableCrossChainDirection = () => {
  const come = getInitialSetting('from', '') as Network;
  const go = getInitialSetting('to', '') as Network;
  const fromMode = getInitialSetting('fMode', '') as NetworkMode;
  const toMode = getInitialSetting('tMode', '') as NetworkMode;
  const from = come ? verticesToChainConfig({ name: come, mode: fromMode ?? 'native' }) : null;
  const to = go ? verticesToChainConfig({ name: go, mode: toMode ?? 'native' }) : null;

  if (from?.isTest === to?.isTest) {
    return { from, to };
  } else if (from) {
    return { from, to: null };
  } else {
    return { from: null, to };
  }
};

const validateDirection: (dir: NullableCrossChainDirection) => NullableCrossChainDirection = (dir) => {
  const { from, to } = dir;
  const isSameEnv = from?.isTest === to?.isTest;
  const reachable = isReachable(from)(to); // from -> to is available;

  return isSameEnv && reachable ? dir : { from: null, to: null };
};

// eslint-disable-next-line complexity
export function CrossChain() {
  const { t, i18n } = useTranslation();
  const [form] = useForm<CrossChainPayload>();

  const {
    network,
    mainConnection: { status: connectionStatus },
    disconnect,
    connectAssistantNetwork,
  } = useApi();

  const [direction, setDirection] = useState(() => validateDirection(getDirectionFromSettings()));
  const [isReady, setIsReady] = useState(false);
  const [submitFn, setSubmit] = useState<SubmitFn>(emptyObsFactory);
  const [bridgeState, setBridgeState] = useState<BridgeState>({ status: 'available' });
  const { tx } = useTx();

  const launch = useCallback(() => {
    form.validateFields().then((values) => submitFn(values));
  }, [form, submitFn]);

  const launchAssistantConnection = useCallback(
    (data: NullableCrossChainDirection) => {
      const { from: departure, to } = data;

      if (departure && to) {
        const bridge = getBridge({ from: departure, to });

        if (bridge.activeAssistantConnection) {
          connectAssistantNetwork(to);
        }
      }
    },
    [connectAssistantNetwork]
  );

  const Content = useMemo(() => {
    const { from, to } = direction;

    if (from && to) {
      const Comp = getCrossChainComponent({ from, to }) as FunctionComponent<CrossChainComponentProps<CrossChainParty>>;

      return Comp ?? null;
    }

    return null;
  }, [direction]);

  useEffect(() => {
    const { from, to } = direction;
    const fromReady = !!from && isSameNetConfig(from, network) && connectionStatus === 'success';

    setIsReady(fromReady && !!to);
  }, [network, connectionStatus, direction]);

  useEffect(() => {
    launchAssistantConnection(direction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form
      name={FORM_CONTROL.direction}
      layout="vertical"
      form={form}
      initialValues={{ direction }}
      validateMessages={validateMessages[i18n.language as 'en' | 'zh-CN' | 'zh']}
      className={tx ? 'filter blur-sm drop-shadow' : ''}
    >
      <Form.Item
        name={FORM_CONTROL.direction}
        rules={[
          { required: true, message: t('Both send and receive network are all required') },
          {
            validator: (_, value: CrossChainDirection) => {
              return (value.from && value.to) || (!value.from && !value.to) ? Promise.resolve() : Promise.reject();
            },
          },
        ]}
        className="mb-0"
      >
        <Direction
          onChange={(value) => {
            setDirection(value);
            form.resetFields([
              FORM_CONTROL.sender,
              FORM_CONTROL.recipient,
              FORM_CONTROL.amount,
              FORM_CONTROL.asset,
              FORM_CONTROL.assets,
              FORM_CONTROL.deposit,
            ]);
            launchAssistantConnection(value);
          }}
        />
      </Form.Item>

      {isReady && Content && (
        <Content
          form={form}
          direction={direction as CrossChainDirection}
          setSubmit={setSubmit}
          setBridgeState={setBridgeState}
        />
      )}

      <div className={connectionStatus === 'success' && direction.from ? 'grid grid-cols-2 gap-4' : ''}>
        <Tooltip title={bridgeState.reason} placement="bottom">
          <div>
            <SubmitButton {...direction} requireTo launch={launch} disabled={bridgeState.status !== 'available'} />
          </div>
        </Tooltip>

        {connectionStatus === 'success' && (
          <FromItemButton
            type="default"
            onClick={() => {
              disconnect();
              form.resetFields();
            }}
            disabled={!!tx}
          >
            {t('Disconnect')}
          </FromItemButton>
        )}
      </div>
    </Form>
  );
}
