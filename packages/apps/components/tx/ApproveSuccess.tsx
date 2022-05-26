import { Typography } from 'antd';
import { SubscanLink } from 'shared/components/widget/SubscanLink';
import { TxDoneComponentProps } from 'shared/model';
import { useITranslation } from '../../hooks';

export function ApproveDone({ value, tx }: TxDoneComponentProps) {
  const { t } = useITranslation();

  return (
    <>
      <Typography.Text>{t('Approve Success {{account}}', { account: value.sender })}</Typography.Text>
      <SubscanLink txHash={tx.hash} network={value.direction.from.meta} className="ml-4">
        {t('View in {{scan}} explorer', { scan: 'Etherscan' })}
      </SubscanLink>
    </>
  );
}
