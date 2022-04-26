import { abi } from '@helix/shared/config/abi';
import { FORM_CONTROL } from '@helix/shared/config/constant';
import {
  AvailableBalance,
  CrossChainComponentProps,
  CrossChainPayload,
  DVMChainConfig,
  PolkadotChainConfig,
  PolkadotConnection,
} from '@helix/shared/model';
import {
  applyModalObs,
  createTxWorkflow,
  dvmAddressToAccountId,
  entrance,
  fromWei,
  getPolkadotChainProperties,
  isKton,
  prettyNumber,
  toWei,
  waitUntilConnected,
} from '@helix/shared/utils';
import { ApiPromise } from '@polkadot/api';
import { BN_ZERO } from '@polkadot/util';
import { Form, Select } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { combineLatest, from } from 'rxjs';
import Web3 from 'web3';
import { Balance } from '../../components/form-control/Balance';
import { EthereumAccountItem } from '../../components/form-control/EthereumAccountItem';
import { FormItemExtra } from '../../components/form-control/FormItemExtra';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferSuccess } from '../../components/tx/TransferSuccess';
import { useAfterTx, useApi, useTx } from '../../hooks';
import { KtonDraw } from './KtonDraw';
import { SmartTxPayload, Substrate2DVMPayload } from './model/cross-chain';
import { redeem } from './utils';

async function getTokenBalanceEth(ktonAddress: string, account = ''): Promise<[string, string]> {
  let ring = '0';
  let kton = '0';

  if (!Web3.utils.isAddress(account)) {
    return [ring, kton];
  }

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

  try {
    ring = await web3.eth.getBalance(account);
  } catch (error) {
    console.error(
      '%c [ get ring balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  try {
    const ktonContract = new web3.eth.Contract(abi.ktonABI, ktonAddress, { gas: 55000 });

    kton = await ktonContract.methods.balanceOf(account).call();
  } catch (error) {
    console.error(
      '%c [ get kton balance in ethereum error ]',
      'font-size:13px; background:pink; color:#bf2c9f;',
      (error as Record<string, string>).message
    );
  }

  return [ring, kton];
}

export function DVM2Substrate({
  form,
  direction,
  setSubmit,
}: CrossChainComponentProps<Substrate2DVMPayload, DVMChainConfig, PolkadotChainConfig>) {
  const { t } = useTranslation();

  const {
    network,
    mainConnection: { accounts },
    assistantConnection,
  } = useApi();

  const { observer } = useTx();
  const { afterCrossChain } = useAfterTx<CrossChainPayload<SmartTxPayload<DVMChainConfig>>>();
  const [availableBalances, setAvailableBalances] = useState<AvailableBalance[]>([]);
  const [pendingClaimAmount, setPendingClaimAmount] = useState<BN>(BN_ZERO);
  const [selectedToken, setSelectedToken] = useState<string>(form.getFieldValue(FORM_CONTROL.asset));
  const kton = useMemo(() => availableBalances.find((item) => isKton(item.asset)), [availableBalances]);

  const apiPromise = useMemo<ApiPromise | null>(
    () => (assistantConnection as PolkadotConnection).api,
    [assistantConnection]
  );

  const availableBalance = useMemo(() => {
    if (selectedToken && availableBalances.length) {
      return availableBalances.find((item) => item.token.symbol === selectedToken);
    }

    return null;
  }, [availableBalances, selectedToken]);

  const getBalances = useCallback(
    (api: ApiPromise, account: string, ktonContract: string) => {
      const balancesObs = from(getTokenBalanceEth(ktonContract, account));
      const chainInfoObs = from(getPolkadotChainProperties(api));

      return combineLatest([chainInfoObs, balancesObs]).subscribe(([{ tokens }, balances]) => {
        const data: AvailableBalance[] = tokens.map((token, index) => ({
          max: balances[index],
          asset: token.symbol,
          token,
        }));

        if (!form.getFieldValue(FORM_CONTROL.asset) && data.length) {
          const symbol = data[0].token.symbol;

          form.setFieldsValue({ [FORM_CONTROL.asset as string]: symbol });
          setSelectedToken(symbol);
        }

        setAvailableBalances(data);
      });
    },
    [form]
  );

  useEffect(() => {
    if (!apiPromise || !accounts[0]) {
      return;
    }

    const sub$$ = getBalances(apiPromise, accounts[0].address, direction.from.dvm.smartKton);

    return () => sub$$.unsubscribe();
  }, [accounts, apiPromise, direction.from.dvm.smartKton, getBalances]);

  useEffect(() => {
    const fn = () => (data: SmartTxPayload<DVMChainConfig>) => {
      const { sender, amount, direction: crossChain } = data;
      const { from: departure } = crossChain;

      const value = {
        ...data,
        amount: toWei({ value: amount }),
      };

      const beforeTransfer = applyModalObs({
        content: <TransferConfirm value={value} />,
      });

      const obs = redeem(value, crossChain);

      const afterTransfer = afterCrossChain(TransferSuccess, {
        hashType: 'txHash',
        onDisappear: () => {
          form.setFieldsValue({
            [FORM_CONTROL.sender]: sender,
          });
          getBalances(apiPromise!, sender, (departure as DVMChainConfig).dvm.smartKton);
        },
        okButtonProps: {
          size: 'large',
          disabled: true,
        },
      })(value);

      return createTxWorkflow(beforeTransfer, obs, afterTransfer).subscribe(observer);
    };

    setSubmit(fn);
  }, [afterCrossChain, apiPromise, form, getBalances, observer, setSubmit]);

  useEffect(() => {
    (async () => {
      const account = accounts[0]?.address;

      if (!network || !account || !apiPromise) {
        return;
      }

      await waitUntilConnected(apiPromise);

      try {
        const address = dvmAddressToAccountId(account).toHuman();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ktonUsableBalance = await (apiPromise.rpc as any).balances.usableBalance(1, address);
        const usableBalance: string = ktonUsableBalance.usableBalance.toString();
        const count = Web3.utils.toBN(usableBalance);

        setPendingClaimAmount(count);
      } catch (error) {
        console.warn((error as Record<string, string>).message);
      }
    })();
  }, [network, direction.to.provider.rpc, accounts, apiPromise]);

  return (
    <>
      {apiPromise && pendingClaimAmount.gt(BN_ZERO) && (
        <Form.Item>
          <KtonDraw
            direction={direction}
            kton={kton?.token}
            pendingClaimAmount={pendingClaimAmount}
            onSuccess={() => setPendingClaimAmount(BN_ZERO)}
          />
        </Form.Item>
      )}

      <EthereumAccountItem
        form={form}
        extra={
          availableBalances.length && (
            <FormItemExtra>
              {t('Available balance {{amount0}} {{symbol0}} {{amount1}} {{symbol1}}', {
                amount0: fromWei({ value: availableBalances[0].max }, prettyNumber),
                amount1: fromWei({ value: availableBalances[1].max }, prettyNumber),
                symbol0: availableBalances[0].token.symbol,
                symbol1: availableBalances[1].token.symbol,
              })}
            </FormItemExtra>
          )
        }
      />

      <RecipientItem
        form={form}
        direction={direction}
        accounts={assistantConnection.accounts}
        extraTip={t(
          'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
          { type: 'Substrate' }
        )}
      />

      <Form.Item label={t('Asset')} name={FORM_CONTROL.asset} rules={[{ required: true }]}>
        <Select
          onSelect={(symbol: string) => {
            setSelectedToken(symbol);
          }}
          size="large"
          placeholder={t('Please select token to be transfer')}
        >
          {availableBalances.map(({ token: { symbol } }) => (
            <Select.Option value={symbol} key={symbol}>
              <span className="uppercase">{symbol}</span>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t('Amount')}
        name={FORM_CONTROL.amount}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value = '0') {
              const asset = getFieldValue(FORM_CONTROL.asset);
              const target = availableBalances.find(({ token: { symbol } }) => symbol === asset);
              const max = new BN(target?.max ?? 0);
              const cur = new BN(toWei({ value }) ?? 0);

              return cur.lt(max) ? Promise.resolve() : Promise.reject();
            },
            message: t(
              'The value entered must be greater than 0 and less than or equal to the maximum available value'
            ),
          }),
        ]}
      >
        <Balance
          placeholder={t('Available Balance {{balance}}', {
            balance: !availableBalance ? t('Querying') : fromWei({ value: availableBalance?.max }, prettyNumber),
          })}
          size="large"
          className="flex-1"
        />
      </Form.Item>
    </>
  );
}
