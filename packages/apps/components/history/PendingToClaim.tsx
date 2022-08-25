import { Button } from 'antd';
import { HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord } from '../../bridges/helix/ethereum-darwinia/model';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim } from '../../providers/claim';

export function PendingToClaim({
  record,
  claimMeta,
}: RecordStatusComponentProps & { claimMeta?: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'> | null }) {
  const { t } = useITranslation();
  const { claim, isClaiming } = useClaim();

  return (
    <Button
      disabled={isClaiming}
      size="small"
      type="primary"
      onClick={() => claim(record as ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>, claimMeta!)}
    >
      {t('Claim')}
    </Button>
  );
}
