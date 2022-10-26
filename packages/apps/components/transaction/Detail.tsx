import { Divider } from 'antd';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { TextWithCopy } from 'shared/components/widget/TextWithCopy';
import { useITranslation } from 'shared/hooks';
import { HelixHistoryRecord, Network } from 'shared/model';
import { revertAccount } from 'shared/utils/helper/address';
import { fromWei, prettyNumber } from 'shared/utils/helper/balance';
import { isCrabDVMHeco } from 'utils/bridge';
import { getChainConfig } from 'utils/network';
import { TransferStep } from '../../model/transfer';
import { ClaimProvider, TxProvider } from '../../providers';
import { IBreadcrumb } from './Breadcrumb';
import { Bridge } from './Bridge';
import { SourceTx } from './SourceTx';
import { TargetTx } from './TargetTx';
import { Timestamp } from './Timestamp';
import { TransferDescription } from './TransferDescription';
import { TransferDetail } from './TransferDetail';
import { TxStatus } from './TxStatus';

interface DetailProps {
  record: HelixHistoryRecord | null;
  transfers: TransferStep[];
}

// eslint-disable-next-line complexity
export function Detail({ record, transfers }: DetailProps) {
  const { t } = useITranslation();
  const router = useRouter();
  const departure = getChainConfig(router.query.from as Network);
  const arrival = getChainConfig(router.query.to as Network);

  const amount = useMemo(() => {
    const token = departure.tokens.find((item) => item.symbol.toLowerCase() === record?.sendToken.toLowerCase());

    return fromWei({ value: record?.sendAmount ?? 0, decimals: token?.decimals ?? 9 }, prettyNumber);
  }, [departure.tokens, record]);

  const feeDecimals = useMemo(() => {
    const token = departure.tokens.find((item) => item.symbol.toLowerCase() === record?.feeToken.toLowerCase());

    return token?.decimals ?? 9;
  }, [departure.tokens, record]);

  return (
    <TxProvider>
      <ClaimProvider>
        <IBreadcrumb txHash={record?.requestTxHash} />

        <h3 className="uppercase text-xs md:text-lg font-bold my-6">{t('transaction detail')}</h3>

        <div className="px-8 py-3 bg-antDark">
          <Bridge />

          <Divider />

          <TxStatus record={record} />

          <SourceTx hash={record?.requestTxHash} />

          <TargetTx record={record} />

          <Timestamp record={record} />

          <Divider />

          <TransferDescription title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
            {record && <TextWithCopy>{revertAccount(record.sender, departure)}</TextWithCopy>}
          </TransferDescription>

          <TransferDescription
            title={t('Receiver')}
            tip={t('Address (external or contract) receiving the transaction.')}
          >
            {record && <TextWithCopy>{revertAccount(record.recipient, arrival)}</TextWithCopy>}
          </TransferDescription>

          {!!transfers.length && <TransferDetail transfers={transfers} />}

          <Divider />

          <TransferDescription
            title={t('Value')}
            tip={t('The amount to be transferred to the recipient with the cross-chain transaction.')}
          >
            {amount} {transfers[0]?.token.name}
          </TransferDescription>

          <TransferDescription
            title={t('Transaction Fee')}
            tip={'Amount paid for processing the cross-chain transaction.'}
          >
            {record && fromWei({ value: record.fee, decimals: feeDecimals })}{' '}
            {record && (record.feeToken === 'null' ? null : record.feeToken)}
          </TransferDescription>

          <Divider />

          <TransferDescription title={t('Nonce')} tip={t('A unique number of cross-chain transaction in Bridge')}>
            {record && (isCrabDVMHeco(record.fromChain, record.toChain) ? record.messageNonce : record.nonce)}
          </TransferDescription>
        </div>
      </ClaimProvider>
    </TxProvider>
  );
}
