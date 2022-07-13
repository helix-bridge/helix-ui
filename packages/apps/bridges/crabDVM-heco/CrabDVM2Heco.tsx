import { message, Typography } from 'antd';
import BN from 'bn.js';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { EMPTY } from 'rxjs';
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
import { SlippageItem } from '../../components/form-control/Slippage';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../hooks';
import { useAccount } from '../../providers';
import { WebClient } from '../cBridge/ts-proto/gateway/GatewayServiceClientPb';
import { EstimateAmtRequest } from '../cBridge/ts-proto/gateway/gateway_pb';
import { IssuingPayload } from './model';
import { issuing } from './utils';

const client = new WebClient(`https://cbridge-prod2.celer.network`, null, null);

const validateBeforeTx = (balance: BN, amount: BN, allowance: BN): string | undefined => {
  const validations: [boolean, string][] = [
    [balance.lt(amount), 'Insufficient balance'],
    [allowance.lt(amount), 'Insufficient allowance'],
  ];
  const target = validations.find((item) => item[0]);

  return target && target[1];
};

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
  const [fee, setFee] = useState<BN | null>(null);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { account } = useAccount();
  const [receiveAmount, setReceiveAmount] = useState<string>('0');
  const [maxSlippage, setMaxSlippage] = useState(0);

  const feeWithSymbol = useMemo(
    () =>
      fee && {
        amount: fromWei({ value: fee, decimals: direction.to.decimals }),
        symbol: direction.from.symbol,
      },
    [direction.from.symbol, direction.to.decimals, fee]
  );

  useEffect(() => {
    updateAllowancePayload({
      spender: '0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573',
      tokenAddress: direction.from.address,
    });
  }, [direction.from.address, updateAllowancePayload]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  useEffect(() => {
    const fn = () => (data: Omit<IssuingPayload, 'maxSlippage'>) => {
      if (!fee || !balances || !allowance) {
        return EMPTY;
      }

      const msg = validateBeforeTx(balances[0] as BN, new BN(toWei(direction.from)), allowance);

      if (msg) {
        message.error(t(msg));
        return EMPTY;
      }

      const payload = {
        ...data,
        direction: {
          ...data.direction,
          to: { ...data.direction.to, amount: fromWei({ value: receiveAmount, decimals: direction.to.decimals }) },
        },
        maxSlippage,
      };

      const beforeTx = applyModalObs({
        content: <TransferConfirm value={payload} fee={feeWithSymbol!}></TransferConfirm>,
      });

      const txObs = issuing(payload);

      return createTxWorkflow(beforeTx, txObs, afterCrossChain(TransferDone, { payload: data }));
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    account,
    afterCrossChain,
    allowance,
    balances,
    direction.from,
    direction.to.decimals,
    fee,
    feeWithSymbol,
    receiveAmount,
    setTxObservableFactory,
    t,
    maxSlippage,
  ]);

  useEffect(() => {
    if (!direction.from.amount || !account) {
      return;
    }

    const estimateRequest = new EstimateAmtRequest();
    const slippage = form.getFieldValue(FORM_CONTROL.slippage);
    const srcChainId = parseInt(direction.from.meta.ethereumChain.chainId, 16);
    const dstChainId = parseInt(direction.to.meta.ethereumChain.chainId, 16);
    const symbol = direction.from.symbol.slice(1); // as RING
    const amount = toWei({ value: direction.from.amount, decimals: direction.from.decimals });

    estimateRequest.setSrcChainId(srcChainId);
    estimateRequest.setDstChainId(dstChainId);
    estimateRequest.setTokenSymbol(symbol);
    estimateRequest.setUsrAddr(account);
    // eslint-disable-next-line no-magic-numbers
    estimateRequest.setSlippageTolerance(slippage * 1e4);
    estimateRequest.setAmt(amount);

    client
      .estimateAmt(estimateRequest, null)
      .then((res) => {
        const { estimatedReceiveAmt, percFee, baseFee, maxSlippage: largestSlippage } = res.toObject();
        const feeTotal = new BN(baseFee).add(new BN(percFee));

        setReceiveAmount(estimatedReceiveAmt);
        setMaxSlippage(largestSlippage);
        setFee(feeTotal);

        if (onFeeChange) {
          onFeeChange({
            amount: +fromWei({ value: feeTotal, decimals: direction.to.decimals }),
            symbol: direction.from.symbol,
          });
        }
      })
      .catch((error) => {
        console.warn('🚀 ~ file: CrabDVM2Heco.tsx ~ line 131 ~ useEffect ~ error', error);
      });
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
  ]);

  return (
    <>
      <div className="hidden">
        <RecipientItem form={form} bridge={bridge} direction={direction} />
      </div>

      <SlippageItem form={form} bridge={bridge} direction={direction} />

      <CrossChainInfo
        bridge={bridge}
        fee={feeWithSymbol}
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
        ]}
      ></CrossChainInfo>
    </>
  );
}
