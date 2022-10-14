import { Button, message, Tooltip } from 'antd';
import isNaN from 'lodash/isNaN';
import { i18n, Trans, useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { initReactI18next } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Logo } from 'shared/components/widget/Logo';
import { FORM_CONTROL } from 'shared/config/constant';
import { CrossToken, EthereumChainConfig } from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { fromWei, largeNumber, prettyNumber } from 'shared/utils/helper/balance';
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
import { CrossChainComponentProps } from '../../../model/component';
import { CrossChainPayload, TxObservableFactory } from '../../../model/tx';
import { useAccount, useWallet } from '../../../providers';
import { IssuingPayload } from './model';
import { EstimateAmtResponse } from './ts-proto/gateway/gateway_pb';
import { CBridgeBridge } from './utils';

export function CBridge({
  allowance,
  form,
  bridge,
  direction,
  balances,
  fee,
  setTxObservableFactory,
}: CrossChainComponentProps<CBridgeBridge, CrossToken<EthereumChainConfig>, CrossToken<EthereumChainConfig>>) {
  const { t } = useTranslation();
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const { account } = useAccount();
  const [estimateResult, setEstimateResult] = useState<EstimateAmtResponse.AsObject | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE * UI_SLIPPAGE_SCALE);
  const [minimalMaxSlippage, setMinimalMaxSlippage] = useState<number | null>(null);
  const { setChainMatched } = useWallet();

  const isPegged = useMemo(() => bridge.isPegged(direction), [bridge, direction]);

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
      .pipe(
        switchMap((isConsistent) => {
          if (isConsistent) {
            return isPegged ? of(0) : from(bridge.getMinimalMaxSlippage(direction));
          }

          return of(NaN);
        })
      )
      .subscribe({
        next: (result) => {
          if (!isNaN(result)) {
            setMinimalMaxSlippage(+result);
            setChainMatched(true);
          } else {
            setChainMatched(false);
          }
        },
        error: (error) => {
          message.error(
            `The active metamask chain is not consistent with required, you must switch it to ${direction.from.host} in metamask`
          );
          console.warn('🚀 ~ file: CBridge.tsx ~ line 126 ~ useEffect ~ error', error);
          setChainMatched(false);
        },
      });

    return () => sub$$.unsubscribe();
  }, [bridge, direction, isPegged, setChainMatched]);

  useEffect(() => {
    form.setFieldsValue({ [FORM_CONTROL.recipient]: account });
  }, [form, account]);

  useEffect(() => {
    const fn = () => (data: Omit<IssuingPayload, 'maxSlippage'>) => {
      if (!estimateResult) {
        message.error('Network error, try again later');
        return;
      }

      const validateObs = data.bridge.validate(data, { balance: balances![0], allowance });
      const { estimatedReceiveAmt, maxSlippage } = estimateResult;

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

      return createTxWorkflow(
        validateObs.pipe(
          mergeMap(() => applyModalObs({ content: <TransferConfirm value={payload} fee={fee}></TransferConfirm> }))
        ),
        () => bridge.send(payload),
        afterCrossChain(TransferDone, { payload })
      );
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [
    afterCrossChain,
    allowance,
    balances,
    bridge,
    direction.from,
    direction.to.decimals,
    estimateResult,
    fee,
    setTxObservableFactory,
  ]);

  useEffect(() => {
    bridge.getEstimateResult(direction, account).then((res) => setEstimateResult(res));
  }, [bridge, account, direction]);

  return (
    <>
      <div className="hidden">
        <RecipientItem form={form} bridge={bridge} direction={direction} />
      </div>

      {!isPegged && (
        <SlippageItem onChange={(value) => setSlippage(value)} form={form} bridge={bridge} direction={direction} />
      )}

      {!!minimalMaxSlippage && minimalMaxSlippage > slippage && (
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
        isDynamicFee
        fee={fee}
        direction={direction}
        extra={[
          {
            name: t('Allowance'),
            content: (
              <span>
                <span>
                  {fromWei({ value: allowance }, largeNumber, (num: string) =>
                    prettyNumber(num, { ignoreZeroDecimal: true })
                  )}
                </span>
                <span className="ml-1">{direction.from.symbol}</span>
              </span>
            ),
          },
          ...extraInfo,
        ]}
      ></CrossChainInfo>
    </>
  );
}
