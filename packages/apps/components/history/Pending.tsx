import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';

export function Pending(_: RecordStatusComponentProps) {
  const { t } = useITranslation();

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-helix-blue">{t('Waiting for fund release')}</span>
    </div>
  );
}
