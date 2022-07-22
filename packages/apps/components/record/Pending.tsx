import { Button } from 'antd';
import { HelixHistoryRecord, ICamelCaseKeys } from 'shared/model';
import { isDarwinia2Ethereum } from 'shared/utils/bridge';
import { Darwinia2EthereumHistoryRes, Darwinia2EthereumRecord } from '../../bridges/ethereum-darwinia/model';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim } from '../../providers/claim';

export function Pending({
  record,
  claimMeta,
}: RecordStatusComponentProps & { claimMeta?: Omit<Darwinia2EthereumHistoryRes, 'list' | 'count'> | null }) {
  const { t } = useITranslation();
  const { claim, isClaiming } = useClaim();
  const { fromChain, toChain } = record;

  if (isDarwinia2Ethereum(fromChain, toChain)) {
    return (
      <Button
        disabled={isClaiming}
        size="small"
        onClick={() => claim(record as ICamelCaseKeys<Darwinia2EthereumRecord & HelixHistoryRecord>, claimMeta!)}
      >
        {t('Claim')}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-helix-blue">{t('Waiting for fund release')}</span>
    </div>
  );
}
