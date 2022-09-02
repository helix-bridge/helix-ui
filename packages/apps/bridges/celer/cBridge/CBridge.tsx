import { Button, message, Tooltip, Typography } from 'antd';
import BN from 'bn.js';
import { isNaN } from 'lodash';
import { i18n, Trans, useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { from, mergeMap, of, switchMap } from 'rxjs';
import { Logo } from 'shared/components/widget/Logo';
import { FORM_CONTROL } from 'shared/config/constant';
import {
  CrabDVMHecoBridgeConfig,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { entrance, isMetamaskChainConsistent } from 'shared/utils/connection';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';

import { RecipientItem } from '../../../components/form-control/RecipientItem';
import {
  DEFAULT_SLIPPAGE,
  SlippageItem,
  SLIPPAGE_SCALE,
  UI_SLIPPAGE_SCALE,
} from '../../../components/form-control/Slippage';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { useAccount, useWallet } from '../../../providers';
import { useTransfer } from './hooks/transfer';
import { IssuingPayload } from './model';
import { EstimateAmtRequest, EstimateAmtResponse } from './ts-proto/gateway/gateway_pb';
import { client, getMinimalMaxSlippage, validate } from './utils';

export function CBridge({
  allowance,
  form,
  bridge,
  direction,
  balances,
  onFeeChange,
  setTxObservableFactory,
  updateAllowancePayload,
}: CrossChainComponentProps<
  CrabDVMHecoBridgeConfig,
  CrossToken<EthereumChainConfig>,
  CrossToken<EthereumChainConfig>
>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { account } = useAccount();
  const [estimateResult, setEstimateResult] = useState<EstimateAmtResponse.AsObject | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE * UI_SLIPPAGE_SCALE);
  const [minimalMaxSlippage, setMinimalMaxSlippage] = useState<number | null>(null);
  const { setChainMatched } = useWallet();
  const { isPegged, sendTx, poolAddress } = useTransfer(direction);

  const feeWithSymbol = useMemo(
    () =>
      estimateResult && {
        amount: fromWei({
          value: new BN(estimateResult.baseFee).add(new BN(estimateResult.percFee)),
          decimals: direction.to.decimals,
        }),
        symbol: direction.from.symbol,
      },
    [direction.to.decimals, direction.from.symbol, estimateResult]
  );

  const extraInfo = useMemo(() => {
    if (!estimateResult) {
      return [];
    }

    return [
      {
        name: t('Bridge Rate'),
        content: estimateResult && (
          <div className="flex items-center gap-1">
            <div className="flex item-center gap-1">
              <span>1 {direction.from.symbol} on</span>
              <Logo name={direction.from.meta.logos[0].name} width={22} height={22} />
            </div>

            <span>≈</span>

            <div className="flex item-center gap-1">
              <Tooltip title={estimateResult.bridgeRate}>
                <span className="truncate cursor-pointer" style={{ maxWidth: '3em' }}>
                  {estimateResult.bridgeRate}
                </span>
              </Tooltip>
              <span> {direction.to.symbol} on </span>
              <Logo name={direction.to.meta.logos[0].name} width={22} height={22} />
            </div>
          </div>
        ),
      },
    ];
  }, [
    direction.from.meta.logos,
    direction.from.symbol,
    direction.to.meta.logos,
    direction.to.symbol,
    estimateResult,
    t,
  ]);

  useEffect(() => {
    const sub$$ = from(isMetamaskChainConsistent(direction.from.meta))
      .pipe(switchMap((isConsistent) => (isConsistent ? from(getMinimalMaxSlippage(poolAddress)) : of(NaN))))
      .subscribe({
        next: (result) => {
          if (!isNaN(result)) {
            setMinimalMaxSlippage(+result);
            setChainMatched(true);
          } else {
            setChainMatched(false);
          }
        },
        error: (_) => {
          message.error(
            `The active metamask chain is not consistent with required, you must switch it to ${direction.from.host} in metamask`
          );
          setChainMatched(false);
        },
      });

    return () => sub$$.unsubscribe();
  }, [direction.from.host, direction.from.meta, poolAddress, setChainMatched]);

  useEffect(() => {
    let promise = Promise.resolve({});

    if (direction.from.host === 'polygon') {
      const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);

      promise = web3.eth.getGasPrice().then((res) => ({
        gasPrice: new BN(res).add(new BN(res).div(new BN(10))).toString(),
      }));
    }

    promise.then((options) => {
      updateAllowancePayload({
        spender: poolAddress,
        tokenAddress: direction.from.address,
        provider: entrance.web3.defaultProvider,
        ...options,
      });
    });
  }, [direction.from.address, direction.from.host, poolAddress, updateAllowancePayload]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  useEffect(() => {
    const fn = () => (data: Omit<IssuingPayload, 'maxSlippage'>) => {
      const validateObs = validate([balances, allowance, estimateResult], {
        balance: balances![0],
        amount: new BN(toWei(direction.from)),
        allowance,
      });

      const { estimatedReceiveAmt, maxSlippage } = estimateResult!;

      const payload = {
        ...data,
        direction: {
          ...data.direction,
          to: {
            ...data.direction.to,
            amount: fromWei({ value: estimatedReceiveAmt, decimals: direction.to.decimals }),
          },
        },
        maxSlippage,
      };

      const beforeTx = validateObs.pipe(
        mergeMap(() =>
          applyModalObs({
            content: <TransferConfirm value={payload} fee={feeWithSymbol!}></TransferConfirm>,
          })
        )
      );

      const txObs = sendTx(payload);

      return createTxWorkflow(beforeTx, txObs, afterCrossChain(TransferDone, { payload }));
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    allowance,
    balances,
    direction.from,
    direction.to.decimals,
    estimateResult,
    feeWithSymbol,
    sendTx,
    setTxObservableFactory,
  ]);

  // eslint-disable-next-line complexity
  useEffect(() => {
    if (!direction.from.amount || !account) {
      setEstimateResult(null);

      if (onFeeChange) {
        onFeeChange(null);
      }

      return;
    }

    const estimateRequest = new EstimateAmtRequest();
    const srcChainId = parseInt(direction.from.meta.ethereumChain.chainId, 16);
    const dstChainId = parseInt(direction.to.meta.ethereumChain.chainId, 16);
    const symbol = direction.from.symbol.startsWith('x')
      ? direction.from.symbol.slice(1)
      : direction.from.symbol.split('.')[0]; // as RING for avalanche the token symbol has suffix .e, remove it here
    const amount = toWei({ value: direction.from.amount, decimals: direction.from.decimals });

    estimateRequest.setSrcChainId(srcChainId);
    estimateRequest.setDstChainId(dstChainId);
    estimateRequest.setTokenSymbol(symbol);
    estimateRequest.setUsrAddr(account);
    estimateRequest.setSlippageTolerance(slippage);
    estimateRequest.setAmt(amount);

    if (isPegged) {
      estimateRequest.setIsPegged(true);
    }

    const sub$$ = from(client.estimateAmt(estimateRequest, null)).subscribe({
      next(res) {
        const result = res.toObject();
        const { estimatedReceiveAmt } = result;
        const fee =
          Number(direction.from.amount) -
          Number(fromWei({ value: estimatedReceiveAmt, decimals: direction.to.decimals }));

        setEstimateResult(result);

        if (onFeeChange) {
          onFeeChange({
            amount: fee,
            symbol: direction.from.symbol,
          });
        }
      },
      error(error) {
        console.warn('🚨 Estimate amount error', error);
      },
    });

    return () => sub$$.unsubscribe();
  }, [
    account,
    direction.from.amount,
    direction.to.decimals,
    direction.from.meta.ethereumChain.chainId,
    direction.from.symbol,
    direction.to.meta.ethereumChain.chainId,
    onFeeChange,
    slippage,
    direction.from.decimals,
    isPegged,
  ]);

  return (
    <>
      <div className="hidden">
        <RecipientItem form={form} bridge={bridge} direction={direction} />
      </div>

      {!isPegged && (
        <SlippageItem onChange={(value) => setSlippage(value)} form={form} bridge={bridge} direction={direction} />
      )}

      {minimalMaxSlippage && minimalMaxSlippage > slippage && (
        <div className="mb-3">
          <Trans i18nKey="recommendSlippage" i18n={i18n?.use(initReactI18next)}>
            Strongly recommend the slippage greater or equal than
            <Button
              type="link"
              className="px-1"
              onClick={() => {
                const recommend = +(minimalMaxSlippage / SLIPPAGE_SCALE).toFixed(2);
                setSlippage(recommend * SLIPPAGE_SCALE);

                form.setFieldsValue({ [FORM_CONTROL.slippage]: recommend });
              }}
            >
              {(minimalMaxSlippage / SLIPPAGE_SCALE).toFixed(2) + '%'}
            </Button>
            to prevent failure
          </Trans>
        </div>
      )}

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
        isDynamicFee
        extra={[
          {
            name: t('Allowance'),
            content: (
              <Typography.Text>
                <span>
                  {fromWei({ value: allowance }, largeNumber, (num: string) =>
                    prettyNumber(num, { ignoreZeroDecimal: true })
                  )}
                </span>
                <span className="ml-1">{direction.from.symbol}</span>
              </Typography.Text>
            ),
          },
          ...extraInfo,
        ]}
      ></CrossChainInfo>
    </>
  );
}
