import { Form, Tooltip, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FORM_CONTROL } from 'shared/config/constant';
import { validateMessages } from 'shared/config/validate-msg';
import {
  BridgeState,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainParty,
  CrossChainPayload,
  CrossToken,
  NullableCrossChainDirection,
  SubmitFn,
} from 'shared/model';
import {
  emptyObsFactory,
  findToken,
  getBridge,
  getBridgeComponent,
  getChainConfig,
  getInitialSetting,
  isSameNetConfig,
} from 'shared/utils';
import { useApi, useTx } from '../hooks';
import { Direction } from './form-control/Direction';
import { FromItemButton, SubmitButton } from './widget/SubmitButton';

const getCrossChainComponent = getBridgeComponent('crossChain');

// eslint-disable-next-line complexity
const getDirectionFromSettings: () => NullableCrossChainDirection = () => {
  const oToken = getInitialSetting<string>('from', null);
  const tToken = getInitialSetting<string>('to', null);

  const from = oToken ? findToken(oToken) : null;
  const to = tToken ? findToken(tToken) : null;

  let fromToken: CrossToken | null = null;
  let toToken: CrossToken | null = null;

  if (from) {
    fromToken = { ...from.token, amount: '' };
  }

  if (to) {
    toToken = { ...to.token, amount: '' };
  }

  return { from: fromToken, to: toToken };
};

const validateDirection: (dir: NullableCrossChainDirection) => NullableCrossChainDirection = (dir) => {
  const { from, to } = dir;

  if (from && to) {
    const reachable = from.bridges.find((item) => item.partner.symbol === to.symbol);
    return reachable ? dir : { from: null, to: null };
  }

  return dir;
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
          const toConfig = getChainConfig(to.name);

          connectAssistantNetwork(toConfig);
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
    const fromConfig = getChainConfig(from?.name);
    const fromReady = !!from && isSameNetConfig(fromConfig, network) && connectionStatus === 'success';

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
      className={`dark:bg-antDark p-5 ${tx ? 'filter blur-sm drop-shadow' : ''}`}
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

      <Form.Item label="Info" className="relative">
        <div className="h-20 w-full flex flex-col justify-center space-y-2 px-4 bg-gray-900">
          <div className="flex justify-between items-center">
            <Typography.Text>Bridge Name</Typography.Text>
            <Typography.Text>Helix Bridge</Typography.Text>
          </div>

          <div className="flex justify-between items-center">
            <Typography.Text>Transaction Fee</Typography.Text>
            <Typography.Text>50 RING</Typography.Text>
          </div>
        </div>
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
            <SubmitButton
              from={getChainConfig(direction.from?.name)}
              to={getChainConfig(direction.to?.name)}
              requireTo
              launch={launch}
              disabled={bridgeState.status !== 'available'}
            />
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
