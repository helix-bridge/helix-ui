import { BN_ZERO } from '@polkadot/util';
import { Button, message, Spin, Typography } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EMPTY, Observable } from 'rxjs';
import { abi } from 'shared/config/abi';
import { FORM_CONTROL } from 'shared/config/constant';
import { Bridge, CrossChainComponentProps, CrossChainPayload, SubmitFn, Tx } from 'shared/model';
import {
  AfterTxCreator,
  applyModalObs,
  approveToken,
  createTxWorkflow,
  entrance,
  fromWei,
  getBridge,
  getErc20TokenBalance,
  getInfoFromHash,
  isKton,
  isRing,
  prettyNumber,
  toWei,
} from 'shared/utils';
import Web3 from 'web3';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { ApproveConfirm } from '../../components/tx/ApproveConfirm';
import { ApproveDone } from '../../components/tx/ApproveSuccess';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount } from '../../providers';
import { EthereumDarwiniaBridgeConfig, TxPayload } from './model';
import { getIssuingFee, redeem } from './utils';

async function getIssuingAllowance(from: string, ringContract: string, issuingContract: string): Promise<BN> {
  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const contract = new web3.eth.Contract(abi.tokenABI, ringContract);
  const allowanceAmount = await contract.methods.allowance(from, issuingContract).call();

  return Web3.utils.toBN(allowanceAmount || 0);
}

type ApproveValue = CrossChainPayload;

function createApproveRingTx(value: Pick<ApproveValue, 'direction' | 'sender'>, after: AfterTxCreator): Observable<Tx> {
  const beforeTx = applyModalObs({
    content: <ApproveConfirm value={value} />,
  });

  const {
    sender,
    direction: { from, to },
  } = value;

  const bridge = getBridge<EthereumDarwiniaBridgeConfig>([from.meta, to.meta]);
  const { ring: tokenAddress, issuing: spender } = bridge.config.contracts;

  const txObs = approveToken({
    sender,
    spender,
    tokenAddress,
  });

  return createTxWorkflow(beforeTx, txObs, after);
}

function createCrossTokenTx(value: CrossChainPayload, after: AfterTxCreator): Observable<Tx> {
  const beforeTx = applyModalObs({
    content: <TransferConfirm value={value} fee={{ amount: 'xx', symbol: 'xx' }} />,
  });
  const txObs = redeem(value as TxPayload);

  return createTxWorkflow(beforeTx, txObs, after);
}

/* ----------------------------------------------Main Section-------------------------------------------------- */

/**
 * @description test chain: ropsten -> pangolin
 */
// eslint-disable-next-line complexity
export function Ethereum2Darwinia({ form, setSubmit, direction, bridge }: CrossChainComponentProps) {
  const { t } = useTranslation();
  const [allowance, setAllowance] = useState<BN>(BN_ZERO);
  const [max, setMax] = useState<BN | null>(null);
  const [fee, setFee] = useState<BN | null>(null);
  const [ringBalance, setRingBalance] = useState<BN | null>(null);
  const [isBalanceQuerying, setIsBalanceQuerying] = useState<boolean>(true);
  const { account } = useAccount();

  const { observer } = useTx();
  const { afterCrossChain, afterApprove } = useAfterTx<ApproveValue>();

  const contracts = useMemo(() => {
    const bridget = getBridge<EthereumDarwiniaBridgeConfig>(direction);

    return bridget.config.contracts;
  }, [direction]);

  const isAllow = useMemo(() => {
    const val = !isRing(direction.from.symbol) ? fee ?? BN_ZERO : new BN(toWei({ value: direction.from.amount }));

    return allowance.gte(val);
  }, [allowance, direction.from.amount, direction.from.symbol, fee]);

  const refreshAllowance = useCallback(() => {
    const {
      contracts: { ring, issuing },
    } = bridge.config as EthereumDarwiniaBridgeConfig;

    getIssuingAllowance(account, ring, issuing).then((num) => {
      setAllowance(num);
      // form.validateFields([FORM_CONTROL.amount]);
    });
  }, [account, bridge.config]);

  const refreshBalance = useCallback(
    (value: Pick<CrossChainPayload, 'direction'>) => {
      const { kton, ring } = contracts;

      setIsBalanceQuerying(true);

      if (isKton(value.direction.from.symbol)) {
        getErc20TokenBalance(kton, account, false).then((balance) => {
          setIsBalanceQuerying(false);
          setMax(balance);
        });
      }

      // always need to refresh ring balance, because of it is a fee token
      getErc20TokenBalance(ring, account, false).then((balance) => {
        if (isRing(value.direction.from.symbol)) {
          setMax(balance);
          setIsBalanceQuerying(false);
        }

        setRingBalance(balance);
      });

      refreshAllowance();
    },
    [account, contracts, refreshAllowance]
  );

  useEffect(() => {
    if (!account) {
      return;
    }

    const { ring, issuing } = contracts;
    const { recipient } = getInfoFromHash();

    form.setFieldsValue({
      [FORM_CONTROL.recipient]: recipient ?? '',
    });

    Promise.all([
      getErc20TokenBalance(ring, account, false),
      getIssuingFee(bridge as Bridge<EthereumDarwiniaBridgeConfig>),
      getIssuingAllowance(account, ring, issuing),
    ]).then(([balance, crossFee, allow]) => {
      setRingBalance(balance);
      setMax(balance);
      setFee(crossFee);
      setAllowance(allow);
      setIsBalanceQuerying(false);
    });
  }, [account, bridge, contracts, direction, form]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (value: CrossChainPayload) => {
      if (!fee || !max || !ringBalance) {
        return;
      }

      const { from } = direction;

      if (ringBalance.lt(fee)) {
        message.error({ content: t('Insufficient fee') });

        return EMPTY.subscribe();
      }

      if (max.lt(new BN(toWei({ value: from.amount })))) {
        message.error({ content: t('Insufficient balance') });
        return EMPTY.subscribe();
      }

      return createCrossTokenTx(
        value,
        afterCrossChain(TransferDone, { onDisappear: refreshBalance, payload: value })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, direction, fee, max, observer, refreshBalance, ringBalance, setSubmit, t]);

  useEffect(() => {
    refreshBalance({ direction });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={
          <span className="inline-block mt-2 px-2">
            <Trans>
              Please be sure to fill in the real Darwinia mainnet account, and keep the account recovery files such as
              mnemonic properly.
            </Trans>
          </span>
        }
      />

      {!isAllow && (
        <Trans i18nKey="approveBalanceInsufficient">
          Exceed the authorized amount, click to authorize more amount, or reduce the transfer amount
          <Button
            onClick={() => {
              const value = { sender: account, direction };

              createApproveRingTx(
                value,
                afterApprove(ApproveDone, { onDisappear: refreshAllowance })(value as CrossChainPayload)
              ).subscribe(observer);
            }}
            size="small"
          >
            approve
          </Button>
        </Trans>
      )}

      <CrossChainInfo
        bridge={bridge}
        fee={
          fee && {
            amount: fromWei({ value: fee, decimals: direction.from.decimals }),
            symbol: direction.from.meta.tokens.find((item) => isRing(item.symbol))!.symbol,
          }
        }
      >
        <div className="flex justify-between items-center">
          <Typography.Text>{t('Available balance')}</Typography.Text>

          {isBalanceQuerying ? (
            <Spin spinning size="small" />
          ) : (
            <Typography.Text className="capitalize">
              <span>{fromWei({ value: max, decimals: direction.from.decimals }, prettyNumber)}</span>
              <span className="capitalize ml-1">{direction.from.symbol}</span>
            </Typography.Text>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Typography.Text>{t('Allowance')}</Typography.Text>

          <Typography.Text className="capitalize">
            <span>{prettyNumber(allowance)}</span>
            <span className="capitalize ml-1">{direction.from.symbol}</span>
          </Typography.Text>
        </div>
      </CrossChainInfo>
    </>
  );
}
