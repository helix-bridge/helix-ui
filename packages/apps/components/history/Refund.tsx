import { Button } from 'antd';
import { isCrabHeco } from 'shared/utils/bridge';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';

export function Refund({ record }: RecordStatusComponentProps) {
  const { t } = useITranslation();
  const { fromChain, toChain } = record;

  if (isCrabHeco(fromChain, toChain)) {
    return (
      <Button type="primary" size="small">
        {t('Refund')}
      </Button>
    );
  }

  return <span className="text-helix-yellow">{t('Refunded')}</span>;
}
