import { Button, Typography } from 'antd';
import BN from 'bn.js';
import { i18n, Trans, useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { from, mergeMap } from 'rxjs';
import { Logo } from 'shared/components/widget/Logo';
import { FORM_CONTROL } from 'shared/config/constant';
import {
  CrabDVMHecoBridgeConfig,
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  DVMChainConfig,
  EthereumChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, largeNumber, prettyNumber, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import {
  DEFAULT_SLIPPAGE,
  SlippageItem,
  SLIPPAGE_SCALE,
  UI_SLIPPAGE_SCALE,
} from '../../components/form-control/Slippage';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount } from '../../providers';
import { WebClient } from '../cBridge/ts-proto/gateway/GatewayServiceClientPb';
import { EstimateAmtRequest, EstimateAmtResponse } from '../cBridge/ts-proto/gateway/gateway_pb';
import { IssuingPayload } from './model';
import { getMinimalMaxSlippage, issuing, validate } from './utils';

const client = new WebClient(`https://cbridge-prod2.celer.network`, null, null);

export function CrabDVM2Heco({
  allowance,
  form,
  bridge,
  direction,
  balances,
  onFeeChange,
  setTxObservableFactory,
  updateAllowancePayload,
}: CrossChainComponentProps<CrabDVMHecoBridgeConfig, CrossToken<EthereumChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { account } = useAccount();
  const [estimateResult, setEstimateResult] = useState<EstimateAmtResponse.AsObject | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE * UI_SLIPPAGE_SCALE);
  const [minimalMaxSlippage, setMinimalMaxSlippage] = useState<number | null>(null);

  const feeWithSymbol = useMemo(
    () =>
      estimateResult && {
        amount: fromWei({
          value: new BN(estimateResult.baseFee).add(new BN(estimateResult.percFee)),
          decimals: direction.to.decimals,
        }),
        symbol: direction.from.symbol,
      },
    [direction.from.symbol, direction.to.decimals, estimateResult]
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
              <span>
                {estimateResult.bridgeRate} {direction.to.symbol} on
              </span>
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
    const sub$$ = from(getMinimalMaxSlippage(bridge.config.contracts.issuing)).subscribe((result) => {
      setMinimalMaxSlippage(+result);
    });

    return () => sub$$.unsubscribe();
  }, [bridge.config.contracts.issuing]);

  useEffect(() => {
    updateAllowancePayload({
      spender: bridge.config.contracts.issuing,
      tokenAddress: direction.from.address,
    });
  }, [bridge.config.contracts.issuing, direction.from.address, updateAllowancePayload]);

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

      const txObs = issuing(payload);

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
    setTxObservableFactory,
  ]);

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
    const symbol = direction.from.symbol.slice(1); // as RING
    const amount = toWei({ value: direction.from.amount, decimals: direction.from.decimals });

    estimateRequest.setSrcChainId(srcChainId);
    estimateRequest.setDstChainId(dstChainId);
    estimateRequest.setTokenSymbol(symbol);
    estimateRequest.setUsrAddr(account);
    estimateRequest.setSlippageTolerance(slippage);
    estimateRequest.setAmt(amount);

    const sub$$ = from(client.estimateAmt(estimateRequest, null)).subscribe({
      next(res) {
        const result = res.toObject();
        const { percFee, baseFee } = result;
        const feeTotal = new BN(baseFee).add(new BN(percFee));

        setEstimateResult(result);

        if (onFeeChange) {
          onFeeChange({
            amount: +fromWei({ value: feeTotal, decimals: direction.to.decimals }),
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
    form,
    onFeeChange,
    direction.from.decimals,
    slippage,
  ]);

  return (
    <>
      <div className="hidden">
        <RecipientItem form={form} bridge={bridge} direction={direction} />
      </div>

      <SlippageItem onChange={(value) => setSlippage(value)} form={form} bridge={bridge} direction={direction} />

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
              <Typography.Text className="capitalize">
                <span>
                  {fromWei({ value: allowance }, largeNumber, (num: string) =>
                    prettyNumber(num, { ignoreZeroDecimal: true })
                  )}
                </span>
                <span className="capitalize ml-1">{direction.from.symbol}</span>
              </Typography.Text>
            ),
          },
          ...extraInfo,
        ]}
      ></CrossChainInfo>
    </>
  );
}
