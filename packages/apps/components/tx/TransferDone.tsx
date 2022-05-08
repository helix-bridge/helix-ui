import { Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { TxSuccessComponentProps } from 'shared/model';
import { isEthereumNetwork } from 'shared/utils';

export function TransferDone({ tx, value, hashType = 'txHash' }: TxSuccessComponentProps) {
  const { t } = useTranslation();
  const linkProps = { [hashType]: tx.hash };

  return (
    <>
      <div className="flex flex-col items-center px-9 py-20 space-y-6">
        <Image alt="..." src="/image/transfer-done.svg" width={133} height={110} />

        <Typography.Paragraph>{t('Transfer Submitted')}</Typography.Paragraph>

        <Typography.Text className="text-center">
          The transaction has been sent, please check the transfer progress in the{' '}
          <Link href="/history">{t('history')}</Link>.
        </Typography.Text>

        <SubscanLink {...linkProps} network={value.direction.from.meta}>
          {t('View in {{scan}} explorer', {
            scan: isEthereumNetwork(value.direction.from.meta) ? 'Etherscan' : 'Subscan',
          })}
        </SubscanLink>
      </div>
    </>
  );
}
