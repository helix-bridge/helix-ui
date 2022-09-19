import { Button } from 'antd';
import { HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord } from '../../bridges/helix/ethereum-darwinia/model';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim } from '../../providers/claim';
import { isDarwinia2Ethereum, isSubstrateDVM2Ethereum } from '../../utils';

export function PendingToClaim({
  record,
  claimMeta,
}: RecordStatusComponentProps & { claimMeta?: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'> | null }) {
  const { t } = useITranslation();
  const { d2eClaim, eth2Claim, isClaiming } = useClaim();

  return (
    <Button
      disabled={isClaiming}
      size="small"
      type="primary"
      onClick={(event) => {
        event.stopPropagation();
        if (isDarwinia2Ethereum(record.fromChain, record.toChain)) {
          d2eClaim(record as ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>, claimMeta!);
        }

        if (isSubstrateDVM2Ethereum(record.fromChain, record.toChain)) {
          eth2Claim(record);
        }
      }}
    >
      {t('Claim')}
    </Button>
  );
}
