import { Button } from 'antd';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim } from '../../providers/claim';
import { isSubstrateDVM2Ethereum } from '../../utils';

export function PendingToClaim({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const { eth2Claim, isClaiming } = useClaim();

  return (
    <Button
      disabled={isClaiming}
      size="small"
      type="primary"
      onClick={(event) => {
        event.stopPropagation();
        if (isSubstrateDVM2Ethereum(record.fromChain, record.toChain)) {
          eth2Claim(record);
        }
      }}
    >
      {t('Claim')}
    </Button>
  );
}
