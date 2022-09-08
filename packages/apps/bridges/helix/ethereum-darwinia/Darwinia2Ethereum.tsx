import { InfoCircleOutlined } from '@ant-design/icons';
import { BN_ZERO, BN } from '@polkadot/util';
import { Tag, Tooltip, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { from } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import {
  CrossChainComponentProps,
  CrossChainPayload,
  CrossToken,
  EthereumChainConfig,
  PolkadotChainConfig,
  TxObservableFactory,
} from 'shared/model';
import { fromWei, isRing, toWei } from 'shared/utils/helper';
import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
import { RecipientItem } from '../../../components/form-control/RecipientItem';
import { TransferConfirm } from '../../../components/tx/TransferConfirm';
import { TransferDone } from '../../../components/tx/TransferDone';
import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
import { useAfterTx } from '../../../hooks';
import { useAccount, useApi } from '../../../providers';
import { EthereumDarwiniaBridgeConfig, RedeemPayload } from './model';
import { getRedeemFee, getRedeemTxFee, redeem, validate } from './utils';

export function Darwinia2Ethereum({
  form,
  setTxObservableFactory,
  direction,
  bridge,
  onFeeChange,
  balances,
}: CrossChainComponentProps<
  EthereumDarwiniaBridgeConfig,
  CrossToken<PolkadotChainConfig>,
  CrossToken<EthereumChainConfig>
>) {
  const { t } = useTranslation();

  const { departureConnection } = useApi();

  const [crossChainFee, setCrossChainFee] = useState<BN | null>(null);
  const [txFee, setTxFee] = useState<BN | null>(null);
  const fee = useMemo(() => (crossChainFee ? crossChainFee.add(txFee ?? BN_ZERO) : null), [crossChainFee, txFee]);
  const { afterCrossChain } = useAfterTx<CrossChainPayload>();
  const [recipient, setRecipient] = useState<string>();
  const { account } = useAccount();

  const feeWithSymbol = useMemo(() => {
    if (fee) {
      const ring = direction.from.meta.tokens.find((item) => isRing(item.symbol))!;

      return {
        amount: fromWei({ value: fee, decimals: ring.decimals }),
        symbol: ring.symbol,
      };
    }

    return null;
  }, [direction, fee]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const fn = () => (data: RedeemPayload) => {
      const {
        direction: {
          from: { amount, symbol, decimals },
        },
      } = data;

      const [ringBalance, ktonBalance] = balances ?? [];
      let availableMaxRing = new BN(0);

      if (ringBalance && fee) {
        const max = ringBalance.sub(fee);

        if (max.gt(new BN(0))) {
          availableMaxRing = max;
        }
      }

      const validateObs = validate([fee, balances], {
        isRING: isRing(symbol),
        balance: isRing(symbol) ? ringBalance : ktonBalance,
        amount: new BN(toWei({ value: amount, decimals })),
        fee,
        ringBalance: availableMaxRing,
      });

      const beforeTransfer = validateObs.pipe(
        mergeMap(() =>
          applyModalObs({
            content: <TransferConfirm fee={feeWithSymbol!} value={data} needClaim />,
          })
        )
      );
      const obs = redeem(data);
      const afterTransfer = afterCrossChain(TransferDone, { payload: data });

      return createTxWorkflow(beforeTransfer, obs, afterTransfer);
    };

    setTxObservableFactory(fn as unknown as TxObservableFactory);
  }, [afterCrossChain, balances, departureConnection, fee, feeWithSymbol, setTxObservableFactory, t]);

  useEffect(() => {
    const sub$$ = from(getRedeemFee(bridge)).subscribe(setCrossChainFee);

    return () => sub$$.unsubscribe();
  }, [bridge]);

  useEffect(() => {
    if (!recipient || !account) {
      return;
    }

    const sub$$ = from(
      getRedeemTxFee(bridge, {
        sender: account,
        recipient,
        amount: +direction.from.amount,
      })
    ).subscribe((result) => setTxFee(result));

    return () => sub$$?.unsubscribe();
  }, [account, bridge, direction.from.amount, recipient]);

  useEffect(() => {
    if (onFeeChange && feeWithSymbol) {
      onFeeChange({ ...feeWithSymbol, amount: 0 });
    }
  }, [feeWithSymbol, onFeeChange]);

  return (
    <>
      <RecipientItem
        form={form}
        direction={direction}
        bridge={bridge}
        extraTip={t(
          'After the transaction is confirmed, the account cannot be changed. Please do not fill in any exchange account or cold wallet address.'
        )}
        onChange={(value) => {
          setRecipient(value);
        }}
      />

      <CrossChainInfo bridge={bridge} fee={feeWithSymbol}>
        <div className={`flex justify-between items-center transition-all duration-100`}>
          <Typography.Text>{t('Attention')}</Typography.Text>
          <Tooltip
            title={t('Please perform a claim asset operation in the history section after the transfer is submitted.')}
          >
            <Tag color="cyan" icon={<InfoCircleOutlined />} className="flex items-center mr-0">
              {t('Need Claim')}
            </Tag>
          </Tooltip>
        </div>
      </CrossChainInfo>
    </>
  );
}
