import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';

export function Refunded(_: RecordStatusComponentProps) {
  const { t } = useITranslation();

  return <span className="text-helix-yellow">{t('Refunded')}</span>;
}
