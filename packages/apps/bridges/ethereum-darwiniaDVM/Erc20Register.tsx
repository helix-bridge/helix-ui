import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { MappingTokenInfo } from 'shared/components/widget/MappingTokenInfo';
import { FORM_CONTROL, RegisterStatus } from 'shared/config/constant';
import { ropstenConfig } from 'shared/config/network';
import { validateMessages } from 'shared/config/validate-msg';
import { useLocalSearch } from 'shared/hooks';
import { Erc20Token, EthereumChainConfig } from 'shared/model';
import {
  chainConfigs,
  getErc20Meta,
  getTokenRegisterStatus,
  hasAvailableDVMBridge,
  isSameNetConfig,
  isValidAddress,
  StoredProof,
  updateStorage,
} from 'shared/utils';
import { Button, Descriptions, Empty, Form, Input, List, Progress, Spin, Tabs, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { from, mergeMap } from 'rxjs';
import Web3 from 'web3';
import { Destination } from '../../components/form-control/Destination';
import { ConnectionIndicator } from '../../components/widget/ConnectionIndicator';
import { SubmitButton } from '../../components/widget/SubmitButton';
import { MemoedTokenInfo, useApi, useMappingTokens, useTx } from '../../hooks';
import { confirmRegister, getRegisterProof, launchRegister } from './utils';

interface UpcomingProps {
  departure: EthereumChainConfig;
}

const DEFAULT_REGISTER_NETWORK = ropstenConfig;

enum TabKeys {
  register = 'register',
  upcoming = 'upcoming',
}

function tokenSearchFactory<T extends Pick<Erc20Token, 'address' | 'symbol'>>(tokens: T[]) {
  return (value: string) => {
    if (!value) {
      return tokens;
    }

    return Web3.utils.isAddress(value)
      ? tokens.filter((token) => token.address === value)
      : tokens.filter((token) => token.symbol.toLowerCase().includes(value.toLowerCase()));
  };
}

function Upcoming({ departure }: UpcomingProps) {
  const { t } = useTranslation();
  const {
    loading,
    tokens: allTokens,
    proofs: knownProofs,
    addKnownProof,
    switchToConfirmed,
  } = useMappingTokens({ from: departure, to: null }, RegisterStatus.registering);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFn = useCallback(tokenSearchFactory(allTokens), [allTokens]);
  const { data, setSearch } = useLocalSearch<MemoedTokenInfo>(searchFn as (arg: string) => MemoedTokenInfo[]);
  const { observer } = useTx();
  const [inQueryingQueue, setInQueryingQueue] = useState<string[]>([]);
  const tokens = useMemo(() => {
    const proofs = knownProofs.map((item) => item.registerProof.source);

    return allTokens.filter((item) => !proofs.includes(item.address) && !inQueryingQueue.includes(item.address));
  }, [allTokens, inQueryingQueue, knownProofs]);

  useEffect(() => {
    if (!tokens.length) {
      return;
    }

    from(tokens)
      .pipe(mergeMap(({ address }) => getRegisterProof(address, departure)))
      .subscribe((proof) => {
        addKnownProof(proof);
      });

    setInQueryingQueue(tokens.map((item) => item.address));
  }, [tokens, departure, addKnownProof]);

  return (
    <>
      <Input.Search
        size="large"
        placeholder={t('Search name or paste address')}
        onChange={(event) => {
          const value = event.target.value;

          setSearch(value);
        }}
      />

      {loading ? (
        <Spin className="mx-auto w-full mt-4"></Spin>
      ) : (
        <List>
          {!data.length && <Empty />}
          {data?.map((token) => (
            <List.Item key={token.address}>
              <MappingTokenInfo token={token}></MappingTokenInfo>
              <UpcomingTokenState
                token={token}
                proofs={knownProofs}
                onConfirm={() => {
                  const proof: StoredProof = knownProofs.find((item) => item.registerProof.source === token.address)!;

                  confirmRegister(proof, departure).subscribe({
                    ...observer,
                    next: (state) => {
                      observer.next(state);
                      if (state.status === 'finalized') {
                        switchToConfirmed(token.address);
                      }
                    },
                  });
                }}
              />
            </List.Item>
          ))}
        </List>
      )}
      <Tip>
        <Trans i18nKey="erc20CompletionTip">
          After {{ type: departure.name }} network returns the result, click [Confirm] to complete the token
          registration.
        </Trans>
      </Tip>
    </>
  );
}

/**
 * confirmed - -1: waiting for proof; 0: confirming 1: confirmed
 */
interface UpcomingTokenStateProps {
  token: MemoedTokenInfo;
  proofs: StoredProof[];
  animate?: boolean;
  onConfirm: () => void;
}

function UpcomingTokenState({ token, onConfirm, proofs, animate = true }: UpcomingTokenStateProps) {
  const { t } = useTranslation();

  if (
    token.status === RegisterStatus.registering &&
    !proofs.map((item) => item.registerProof.source).includes(token.address)
  ) {
    return animate ? <LoadingOutlined /> : <Progress type="circle" percent={50} format={() => ''} />;
  }

  if (token.status === RegisterStatus.registered) {
    return <CheckCircleOutlined />;
  }

  return (
    <Button
      size="small"
      onClick={onConfirm}
      style={{
        pointerEvents: 'all',
      }}
    >
      {t('Confirm')}
    </Button>
  );
}

function Tip({ children }: PropsWithChildren<string | ReactNode>) {
  return (
    <Form.Item className="text-xs mb-0 mt-8">
      <span className="text-gray-600">{children}</span>
    </Form.Item>
  );
}

// eslint-disable-next-line complexity
export function Erc20Register() {
  const { t } = useTranslation();
  const [form] = useForm();
  const [net, setNet] = useState<EthereumChainConfig>(DEFAULT_REGISTER_NETWORK);

  const {
    mainConnection: { status },
    network,
  } = useApi();

  const [active, setActive] = useState(TabKeys.register);
  const [inputValue, setInputValue] = useState('');
  const [registeredStatus, setRegisteredStatus] = useState(-1);
  const [token, setToken] = useState<Pick<Erc20Token, 'logo' | 'name' | 'symbol' | 'decimals' | 'address'> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { tokens, dispatch } = useMappingTokens(
    { from: network as EthereumChainConfig, to: null },
    RegisterStatus.registering
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchFn = useCallback(tokenSearchFactory(tokens), [tokens]);
  const { data } = useLocalSearch(searchFn as (arg: string) => Erc20Token[]);
  const { observer } = useTx();
  const networks = useMemo(() => chainConfigs.filter((item) => item.category.includes('ethereum')), []);

  const canStart = useMemo(
    () =>
      status === 'success' &&
      isSameNetConfig(network, net) &&
      hasAvailableDVMBridge(net) &&
      isValidAddress(inputValue, 'ethereum'),
    [inputValue, net, network, status]
  );

  useEffect(() => {
    if (!canStart) {
      setRegisteredStatus(-1);
      setToken(null);
      return;
    }

    (async () => {
      setIsLoading(true);

      const searchValue = !inputValue.startsWith('0x') ? '0x' + inputValue : inputValue;
      const tokenStatus = await getTokenRegisterStatus(searchValue, net);
      const result = await getErc20Meta(searchValue);

      setRegisteredStatus(tokenStatus === null ? -1 : tokenStatus);
      setToken({ ...result, address: searchValue, decimals: +result.decimals });
      setIsLoading(false);
    })();
  }, [canStart, inputValue, net]);

  useEffect(() => {
    updateStorage({ from: net.name });
  }, [net]);

  return (
    <Form
      name={FORM_CONTROL.direction}
      layout="vertical"
      form={form}
      initialValues={{ host: DEFAULT_REGISTER_NETWORK }}
      onFinish={() => {
        launchRegister(inputValue, net).subscribe({
          ...observer,
          next: (tx) => {
            observer.next(tx);

            if (tx.status === 'finalized') {
              dispatch({ payload: [token as Erc20Token, ...data], type: 'updateTokens' });
            }
          },
        });
      }}
      validateMessages={validateMessages.en}
    >
      <Form.Item name="host" label={t('Host Network')} rules={[{ required: true }]}>
        <Destination
          networks={networks}
          extra={<ConnectionIndicator config={net} />}
          onChange={(value) => {
            if (value) {
              setNet(value as EthereumChainConfig);
            }
          }}
        />
      </Form.Item>

      <Tabs type="card" activeKey={active} onTabClick={(key) => setActive(key as TabKeys)}>
        <Tabs.TabPane tab={t('Register Token')} key={TabKeys.register}>
          <Form.Item
            name="address"
            label={t('Token Contract Address')}
            validateFirst
            rules={[
              { required: true },
              {
                validator(_, value) {
                  return isValidAddress(value, 'ethereum') ? Promise.resolve() : Promise.reject();
                },
                message: t('Invalid token contract address'),
              },
            ]}
          >
            <Input.Search
              placeholder={t('Token Contract Address')}
              size="large"
              disabled={hasAvailableDVMBridge(net)}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
            />
          </Form.Item>

          {isLoading ? (
            <Form.Item>
              <Spin size="small" className="w-full text-center"></Spin>
            </Form.Item>
          ) : (
            token && (
              <Form.Item
                label={t('Token Info')}
                style={{
                  display: form.getFieldError(['address']).length || !inputValue ? 'none' : 'block',
                }}
              >
                <Descriptions bordered>
                  <Descriptions.Item label={t('Symbol')}>{token?.symbol}</Descriptions.Item>
                  <Descriptions.Item label={t('Decimals of Precision')}>{token?.decimals}</Descriptions.Item>
                </Descriptions>
              </Form.Item>
            )
          )}

          <SubmitButton disabled={isLoading || registeredStatus !== 0} from={net} to={null}>
            {t('Register')}
          </SubmitButton>

          <Tip>
            <Trans i18nKey="erc20RegistrationTip">
              After submit the registration, please wait for the {{ network }} network to return the result, click
              <Typography.Link onClick={() => setActive(TabKeys.upcoming)}> Upcoming </Typography.Link>to view the
              progress.
            </Trans>
          </Tip>
        </Tabs.TabPane>

        <Tabs.TabPane tab={t('Upcoming')} key={TabKeys.upcoming}>
          <Upcoming departure={net} />
        </Tabs.TabPane>
      </Tabs>
    </Form>
  );
}
