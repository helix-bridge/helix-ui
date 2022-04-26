import { abi } from '@helix/shared/config/abi';
import { FORM_CONTROL, LONG_DURATION, RegisterStatus } from '@helix/shared/config/constant';
import { useDarwiniaAvailableBalances, useIsMounted } from '@helix/shared/hooks';
import {
  AvailableBalance,
  ChainConfig,
  CrossChainComponentProps,
  CrossChainDirection,
  CrossChainPayload,
  DailyLimit,
  DVMChainConfig,
  MappingToken,
  Network,
  PolkadotChainConfig,
  Token,
} from '@helix/shared/model';
import {
  amountLessThanFeeRule,
  applyModalObs,
  createTxWorkflow,
  entrance,
  fromWei,
  getKnownMappingTokens,
  getS2SMappingAddress,
  insufficientBalanceRule,
  insufficientDailyLimit,
  invalidFeeRule,
  isRing,
  pollWhile,
  prettyNumber,
  toWei,
  waitUntilConnected,
  zeroAmountRule,
} from '@helix/shared/utils';
import { Codec } from '@polkadot/types/types';
import { Descriptions, Form, Progress, Select } from 'antd';
import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import BN from 'bn.js';
import { capitalize, last } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY, from, of, Subscription, switchMap, takeWhile } from 'rxjs';
import { Balance } from '../../components/form-control/Balance';
import { MaxBalance } from '../../components/form-control/MaxBalance';
import { PolkadotAccountsItem } from '../../components/form-control/PolkadotAccountsItem';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferSuccess } from '../../components/tx/TransferSuccess';
import { useAfterTx, useApi, useDeparture, useTx } from '../../hooks';
import { useBridgeStatus } from './hooks';
import { IssuingSubstrateTxPayload, Substrate2SubstrateDVMPayload } from './model';
import { issuing } from './utils/tx';

/* ----------------------------------------------Base info helpers-------------------------------------------------- */

/* ----------------------------------------------Tx section-------------------------------------------------- */

interface TransferInfoProps {
  fee: BN | null;
  balance: BN | string | number;
  amount: string;
  token: Token;
  dailyLimit: DailyLimit | null;
}

// eslint-disable-next-line complexity
function TransferInfo({ fee, balance, token, amount, dailyLimit }: TransferInfoProps) {
  const { decimals } = token;
  const value = new BN(toWei({ value: amount || '0', decimals }));
  const iterationCount = 5;

  if (!fee || !balance) {
    return null;
  }

  if (fee.lt(new BN(0))) {
    return (
      <p className="text-red-400 animate-pulse" style={{ animationIterationCount: iterationCount }}>
        <Trans>Bridge is not healthy, try it again later</Trans>
      </p>
    );
  }

  return (
    <Descriptions size="small" column={1} labelStyle={{ color: 'inherit' }} className="text-green-400">
      {value.gte(fee) && !value.isZero() && (
        <Descriptions.Item label={<Trans>Recipient will receive</Trans>} contentStyle={{ color: 'inherit' }}>
          {fromWei({ value: value.sub(fee), decimals })} x{token.symbol}
        </Descriptions.Item>
      )}
      <Descriptions.Item label={<Trans>Cross-chain Fee</Trans>} contentStyle={{ color: 'inherit' }}>
        <span className="flex items-center">
          {fromWei({ value: fee, decimals })} {token.symbol}
        </span>
      </Descriptions.Item>

      <Descriptions.Item label={<Trans>Daily Limit</Trans>} contentStyle={{ color: 'inherit' }}>
        {dailyLimit ? (
          fromWei({ value: new BN(dailyLimit.limit).sub(new BN(dailyLimit.spentToday)), decimals: 9 })
        ) : (
          <Trans>Querying</Trans>
        )}
      </Descriptions.Item>
    </Descriptions>
  );
}

/* ----------------------------------------------Main Section-------------------------------------------------- */

/**
 * @description test chain: pangoro -> pangolin dvm
 */
// eslint-disable-next-line complexity
export function Substrate2SubstrateDVM({
  form,
  setSubmit,
  direction,
  setBridgeState,
}: CrossChainComponentProps<Substrate2SubstrateDVMPayload, PolkadotChainConfig, DVMChainConfig>) {
  const { t } = useTranslation();

  const {
    mainConnection: { accounts },
    api,
    chain,
  } = useApi();
  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);

  const availableBalance = useMemo(() => {
    const balance = availableBalances[0];

    if (!balance) {
      return null;
    }

    const { max, token, ...rest } = balance;
    const reserved = new BN(toWei({ value: '1', decimals: token.decimals ?? 9 }));
    const greatest = new BN(max);
    const result = greatest.sub(reserved);

    return { ...rest, token, max: result.gte(new BN(0)) ? result.toString() : '0' };
  }, [availableBalances]);

  const [curAmount, setCurAmount] = useState<string>(() => form.getFieldValue(FORM_CONTROL.amount) ?? '');
  const [fee, setFee] = useState<BN | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const { updateDeparture } = useDeparture();
  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload<Substrate2SubstrateDVMPayload>>();
  const getAvailableBalances = useDarwiniaAvailableBalances();
  const [targetChainTokens, setTargetChainTokens] = useState<MappingToken[]>([]);
  const bridgeState = useBridgeStatus(direction);

  const getBalances = useCallback<(acc: string) => Promise<AvailableBalance[]>>(
    async (account: string) => {
      if (!api || !chain.tokens.length || !form.getFieldValue(FORM_CONTROL.asset)) {
        return [];
      }

      const asset = form.getFieldValue(FORM_CONTROL.asset) as string;
      const balances = await getAvailableBalances(account);

      return balances.filter((item) => asset.toLowerCase().includes(item.asset.toLowerCase()));
    },
    [api, chain.tokens.length, form, getAvailableBalances]
  );

  const getDailyLimit = useCallback<(symbol: string) => Promise<DailyLimit | null>>(
    async (symbol: string) => {
      if (!targetChainTokens.length) {
        return null;
      }

      const { to: arrival } = direction as CrossChainDirection<ChainConfig, DVMChainConfig>;
      const web3 = entrance.web3.getInstance(arrival.ethereumChain.rpcUrls[0]);
      const mappingAddress = await getS2SMappingAddress(arrival.provider.rpc);
      const contract = new web3.eth.Contract(abi.S2SMappingTokenABI, mappingAddress);
      const token = targetChainTokens.find((item) => isRing(item.symbol));
      const ringAddress = token?.address;
      const tokenAddress = isRing(symbol) ? ringAddress : '';

      if (!tokenAddress) {
        return null;
      }

      const limit = await contract.methods.dailyLimit(tokenAddress).call();
      const spentToday = await contract.methods.spentToday(tokenAddress).call();

      return { limit, spentToday };
    },
    [targetChainTokens, direction]
  );

  const isMounted = useIsMounted();

  useEffect(() => {
    setBridgeState({ status: bridgeState.status, reason: bridgeState.reason });
  }, [bridgeState.status, bridgeState.reason, setBridgeState]);

  useEffect(() => {
    const fn = () => (data: IssuingSubstrateTxPayload) => {
      if (!api || !fee) {
        return EMPTY.subscribe();
      }

      const { sender, amount, asset } = data;
      const decimals = chain.tokens.find((item) => item.symbol === asset)?.decimals || 9;
      const value = {
        ...data,
        amount: new BN(toWei({ value: amount, decimals })).sub(fee).toString(),
      };
      const beforeTransfer = applyModalObs({
        content: <TransferConfirm value={value} decimals={decimals} />,
      });
      const obs = issuing(value, api, fee);
      const afterTransfer = afterCrossChain(TransferSuccess, {
        hashType: 'block',
        onDisappear: () => {
          form.setFieldsValue({
            [FORM_CONTROL.sender]: sender,
          });
          getBalances(sender).then(setAvailableBalances);
        },
        decimals,
      })(value);

      return createTxWorkflow(beforeTransfer, obs, afterTransfer).subscribe(observer);
    };

    setSubmit(fn);
  }, [afterCrossChain, api, chain.tokens, fee, form, getBalances, observer, setAvailableBalances, setSubmit]);

  useEffect(() => {
    const sub$$ = getKnownMappingTokens('null', { from: direction.to, to: direction.from }).subscribe(({ tokens }) => {
      setTargetChainTokens(tokens.filter((item) => item.status === RegisterStatus.registered));
    });

    return () => sub$$?.unsubscribe();
  }, [direction]);

  useEffect(() => {
    const sender = (accounts && accounts[0] && accounts[0].address) || '';

    form.setFieldsValue({ [FORM_CONTROL.sender]: sender });

    updateDeparture({ from: form.getFieldValue(FORM_CONTROL.direction).from, sender });
  }, [form, api, accounts, updateDeparture]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const subscription = from(waitUntilConnected(api))
      .pipe(
        switchMap(() => {
          const section = direction.to.isTest ? `${direction.to.name}FeeMarket` : 'feeMarket';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (api.query as any)[section]['assignedRelayers']().then((data: Codec) => data.toJSON()) as Promise<
            { id: string; collateral: number; fee: number }[]
          >;
        })
      )
      .subscribe((res) => {
        const marketFee = last(res)?.fee.toString();

        setFee(new BN(marketFee ?? -1)); // -1: fee market does not available
      });

    return () => subscription?.unsubscribe();
  }, [api, direction.to.isTest, direction.to.name]);

  useEffect(() => {
    const sender = (accounts && accounts[0] && accounts[0].address) || '';
    const subscription = from(getBalances(sender)).subscribe(setAvailableBalances);

    return () => subscription.unsubscribe();
  }, [accounts, getBalances, setAvailableBalances]);

  useEffect(() => {
    let sub$$: Subscription | null = null;
    let sub2$$: Subscription | null = null;

    if (chain.tokens.length) {
      const asset = chain.tokens[0].symbol;

      sub$$ = from(getBalances(form.getFieldValue(FORM_CONTROL.sender))).subscribe(setAvailableBalances);
      sub2$$ = of(null)
        .pipe(
          switchMap(() => from(getDailyLimit(asset))),
          pollWhile(LONG_DURATION, () => isMounted)
        )
        .subscribe(setDailyLimit);

      form.setFieldsValue({ [FORM_CONTROL.asset]: asset });
    }

    return () => {
      sub$$?.unsubscribe();
      sub2$$?.unsubscribe();
    };
  }, [chain.tokens, form, getBalances, getDailyLimit, isMounted, setAvailableBalances, setDailyLimit]);

  return (
    <>
      <PolkadotAccountsItem
        availableBalances={availableBalances}
        onChange={(value) =>
          from(getBalances(value))
            .pipe(takeWhile(() => isMounted))
            .subscribe(setAvailableBalances)
        }
      />

      <RecipientItem
        form={form}
        direction={direction}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
        isDvm
      />

      <Form.Item name={FORM_CONTROL.asset} label={t('Asset')} rules={[{ required: true }]}>
        <Select
          size="large"
          onChange={(value: string) => {
            from(getBalances(form.getFieldValue(FORM_CONTROL.sender)))
              .pipe(takeWhile(() => isMounted))
              .subscribe(setAvailableBalances);

            from(getDailyLimit(value))
              .pipe(takeWhile(() => isMounted))
              .subscribe(setDailyLimit);
          }}
          placeholder={t('Please select token to be transfer')}
        >
          {(chain.tokens || []).map(({ symbol }, index) => (
            <Select.Option value={symbol} key={symbol + '_' + index} disabled={/kton/i.test(symbol)}>
              <span>{symbol}</span>
              {/** FIXME: what's the name ? we can only get symbol, decimals and ss58Format from api properties  */}
              <sup className="ml-2 text-xs" title={t('name')}>
                {t('{{network}} native token', {
                  network: capitalize(form.getFieldValue(FORM_CONTROL.direction)?.from?.name ?? ''),
                })}
              </sup>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {!chain.tokens.length && (
        <Progress
          percent={100}
          showInfo={false}
          status="active"
          strokeColor={{ from: '#5745de', to: '#ec3783' }}
          className="relative -top-6"
        />
      )}

      <Form.Item
        name={FORM_CONTROL.amount}
        validateFirst
        label={t('Amount')}
        rules={[
          { required: true },
          invalidFeeRule({ t, compared: fee }),
          zeroAmountRule({ t }),
          amountLessThanFeeRule({
            t,
            compared: fee ? fee.toString() : null,
            token: availableBalance?.token,
            asset: String(form.getFieldValue(FORM_CONTROL.asset)),
          }),
          insufficientBalanceRule({
            t,
            compared: availableBalance?.max,
            token: availableBalance?.token,
          }),
          insufficientDailyLimit({
            t,
            compared: new BN(dailyLimit?.limit ?? '0').sub(new BN(dailyLimit?.spentToday ?? '0')).toString(),
            token: availableBalance?.token,
          }),
        ]}
      >
        <Balance
          size="large"
          placeholder={t('Available Balance {{balance}}', {
            balance: !availableBalance
              ? t('Querying')
              : fromWei({ value: availableBalance?.max, decimals: availableBalance?.token.decimals }, prettyNumber),
          })}
          className="flex-1"
          onChange={(val) => setCurAmount(val)}
        >
          <MaxBalance
            network={form.getFieldValue(FORM_CONTROL.direction).from?.name as Network}
            onClick={() => {
              if (!availableBalance) {
                return;
              }

              const { token, max } = availableBalance;
              const amount = fromWei({ value: max, decimals: token.decimals });

              form.setFieldsValue({ [FORM_CONTROL.amount]: amount });
              setCurAmount(amount);
            }}
            size="large"
          />
        </Balance>
      </Form.Item>

      {!!availableBalances.length && availableBalances[0].token && (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <ErrorBoundary>
          <TransferInfo
            fee={fee}
            balance={availableBalances[0].max}
            amount={curAmount}
            token={availableBalances[0].token}
            dailyLimit={dailyLimit}
          />
        </ErrorBoundary>
      )}
    </>
  );
}
