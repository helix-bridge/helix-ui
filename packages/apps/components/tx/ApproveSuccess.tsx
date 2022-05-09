import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { TxDoneComponentProps } from 'shared/model';

export function ApproveDone({ value, tx }: TxDoneComponentProps) {
  const { t } = useTranslation();

  return (
    <>
      <Typography.Text>{t('Approve Success {{account}}', { account: value.sender })}</Typography.Text>
      <SubscanLink txHash={tx.hash} network={value.direction.from.meta} className="ml-4">
        {t('View in {{scan}} explorer', { scan: 'Etherscan' })}
      </SubscanLink>
    </>
  );
}
