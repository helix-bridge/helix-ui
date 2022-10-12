import { ExplorerLink } from 'shared/components/widget/ExplorerLink';
import { useITranslation } from '../../hooks';
import { TxDoneComponentProps } from '../../model/component';

export function ApproveDone({ value, tx }: TxDoneComponentProps) {
  const { t } = useITranslation();

  return (
    <>
      <span>{t('Approve Success {{account}}', { account: value.sender })}</span>
      <ExplorerLink txHash={tx.hash} network={value.direction.from.meta} className="ml-4">
        {t('View in explorer')}
      </ExplorerLink>
    </>
  );
}
