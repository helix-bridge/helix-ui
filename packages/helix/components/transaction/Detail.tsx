import { Divider, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useITranslation } from 'shared/hooks';
import { HelixHistoryRecord, Network } from 'shared/model';
import { isCrabDVMHeco } from 'shared/utils/bridge';
import { fromWei, prettyNumber, revertAccount } from 'shared/utils/helper';
import { getChainConfig } from 'shared/utils/network';
import { TransferStep } from '../../model/transfer';
import { IBreadcrumb } from './Breadcrumb';
import { Bridge } from './Bridge';
import { SourceTx } from './SourceTx';
import { TargetTx } from './TargetTx';
import { Timestamp } from './Timestamp';
import { TransferDescription } from './TransferDescription';
import { TransferDetail } from './TransferDetail';
import { TxStatus } from './TxStatus';

interface DetailProps {
  record: HelixHistoryRecord;
  transfers: TransferStep[];
}

export function Detail({ record, transfers }: DetailProps) {
  const { t } = useITranslation();
  const router = useRouter();
  const departure = getChainConfig(router.query.from as Network);
  const arrival = getChainConfig(router.query.to as Network);

  const amount = useMemo(() => {
    const token = departure.tokens.find((item) => item.symbol.toLowerCase() === record.token.toLowerCase());

    return fromWei({ value: record?.amount ?? 0, decimals: token?.decimals ?? 9 }, prettyNumber);
  }, [departure.tokens, record?.amount, record.token]);

  const feeDecimals = useMemo(() => {
    const token = departure.tokens.find((item) => item.symbol.toLowerCase() === record.feeToken.toLowerCase());

    return token?.decimals ?? 9;
  }, [departure.tokens, record.feeToken]);

  return (
    <>
      <IBreadcrumb txHash={record.requestTxHash} />

      <div className="flex justify-between items-center mt-6">
        <h3 className="uppercase text-xs md:text-lg">{t('transaction detail')}</h3>
        <Bridge />
      </div>

      <div className="px-8 py-3 mt-6 bg-gray-200 dark:bg-antDark">
        <SourceTx hash={record.requestTxHash} />

        <TargetTx record={record} />

        <TxStatus record={record} />

        <Timestamp record={record} />

        <Divider />

        <TransferDescription title={t('Sender')} tip={t('Address (external or contract) sending the transaction.')}>
          <Typography.Text copyable className="truncate">
            {revertAccount(record.sender, departure)}
          </Typography.Text>
        </TransferDescription>

        <TransferDescription title={t('Receiver')} tip={t('Address (external or contract) receiving the transaction.')}>
          <Typography.Text copyable className="truncate">
            {revertAccount(record.recipient, arrival)}
          </Typography.Text>
        </TransferDescription>

        {!!transfers.length && <TransferDetail transfers={transfers} amount={amount} />}

        <Divider />

        <TransferDescription
          title={t('Value')}
          tip={t('The amount to be transferred to the recipient with the cross-chain transaction.')}
        >
          {amount} {transfers[0].token.name}
        </TransferDescription>

        <TransferDescription
          title={t('Transaction Fee')}
          tip={'Amount paid for processing the cross-chain transaction.'}
        >
          {fromWei({ value: record.fee, decimals: feeDecimals })} {record.feeToken === 'null' ? null : record.feeToken}
        </TransferDescription>

        <Divider />

        <TransferDescription title={t('Nonce')} tip={t('A unique number of cross-chain transaction in Bridge')}>
          {isCrabDVMHeco(record.fromChain, record.toChain) ? record.laneId : record.nonce}
        </TransferDescription>
      </div>
    </>
  );
}
