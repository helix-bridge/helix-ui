import { Typography } from 'antd';
import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { TxDoneComponentProps } from 'shared/model';
import { useITranslation } from '../../hooks';

export function ApproveDone({ value, tx }: TxDoneComponentProps) {
  const { t } = useITranslation();

  return (
    <>
      <Typography.Text>{t('Approve Success {{account}}', { account: value.sender })}</Typography.Text>
      <ExplorerLink txHash={tx.hash} network={value.direction.from.meta} className="ml-4">
        {t('View in explorer')}
      </ExplorerLink>
    </>
  );
}
