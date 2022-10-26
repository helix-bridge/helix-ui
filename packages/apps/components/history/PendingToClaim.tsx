import { Button } from 'antd';
import { useITranslation } from 'shared/hooks/translation';
import { RecordStatusComponentProps } from '../../model/component';
import { useClaim } from '../../providers/claim';

export function PendingToClaim({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const { claim, isClaiming } = useClaim();

  return (
    <Button
      disabled={isClaiming}
      size="small"
      type="primary"
      onClick={(event) => {
        event.stopPropagation();
        claim(record);
      }}
    >
      {t('Claim')}
    </Button>
  );
}
