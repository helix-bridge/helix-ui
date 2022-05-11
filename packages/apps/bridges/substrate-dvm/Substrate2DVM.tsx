import { InfoCircleOutlined } from '@ant-design/icons';
import { message, Tag, Tooltip } from 'antd';
import BN from 'bn.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY, from } from 'rxjs';
import { useDarwiniaAvailableBalances } from 'shared/hooks';
import {
  AvailableBalance,
  CrossChainComponentProps,
  CrossToken,
  DVMChainConfig,
  PolkadotChainConfig,
  SubmitFn,
} from 'shared/model';
import { applyModalObs, createTxWorkflow, fromWei, isKton, prettyNumber, toWei } from 'shared/utils';
import { RecipientItem } from '../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../components/tx/TransferConfirm';
import { TransferDone } from '../../components/tx/TransferDone';
import { CrossChainInfo } from '../../components/widget/CrossChainInfo';
import { useAfterTx, useTx } from '../../hooks';
import { useAccount, useApi } from '../../providers';
import { SubstrateDVMBridgeConfig, TransferPayload } from './model';
import { issuing } from './utils';

const validateBeforeTx = (balance: BN, amount: BN): string | undefined =>
  balance.lt(amount) ? 'Insufficient balance' : void 0;

export function Substrate2DVM({
  form,
  direction,
  bridge,
  onFeeChange,
  setSubmit,
}: CrossChainComponentProps<SubstrateDVMBridgeConfig, CrossToken<PolkadotChainConfig>, CrossToken<DVMChainConfig>>) {
  const { t } = useTranslation();
  const { api, network } = useApi();
  const [balance, setBalance] = useState<AvailableBalance | null>(null);
  const getBalances = useDarwiniaAvailableBalances(api, network);
  const { afterCrossChain } = useAfterTx<TransferPayload>();
  const { observer } = useTx();
  const { account } = useAccount();

  const getBalance = useCallback(
    () =>
      from(getBalances(account)).subscribe((result) => {
        const target = result.find((item) => item.symbol === direction.from.symbol);

        setBalance(target ?? null);
      }),
    [account, direction.from.symbol, getBalances]
  );

  useEffect(() => {
    const fn = () => (data: TransferPayload) => {
      if (!api || !balance) {
        return EMPTY.subscribe();
      }

      const msg = validateBeforeTx(new BN(balance.balance), new BN(toWei(data.direction.from)));

      if (msg) {
        message.error(t(msg));
        return EMPTY.subscribe();
      }

      return createTxWorkflow(
        applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }),
        issuing(data, api),
        afterCrossChain(TransferDone, {
          hashType: 'block',
          onDisappear: getBalance,
          payload: data,
        })
      ).subscribe(observer);
    };

    setSubmit(fn as unknown as SubmitFn);
  }, [afterCrossChain, api, balance, getBalance, observer, setSubmit, t]);

  useEffect(() => {
    const sub$$ = getBalance();

    return () => sub$$.unsubscribe();
  }, [getBalance]);

  useEffect(() => {
    if (onFeeChange) {
      onFeeChange(0);
    }
  }, [onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in the exchange account.'
        )}
      />

      <CrossChainInfo
        bridge={bridge}
        balance={
          balance && {
            amount: fromWei(balance, prettyNumber),
            symbol: direction.from.symbol,
          }
        }
        hideFee
        fee={null}
        extra={
          isKton(direction.from.symbol)
            ? [
                {
                  name: t('Attention'),
                  content: (
                    <Tooltip
                      title={t(
                        'Please perform a claim asset operation in the history section after the transfer is submitted.'
                      )}
                    >
                      <Tag color="cyan" icon={<InfoCircleOutlined />} className="flex items-center mr-0">
                        {t('Need claim')}
                      </Tag>
                    </Tooltip>
                  ),
                },
              ]
            : []
        }
      ></CrossChainInfo>
    </>
  );
}
