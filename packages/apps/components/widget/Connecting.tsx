import { useITranslation } from '../../hooks';
import { Wifi } from './Wifi';

export function Connecting() {
  const { t } = useITranslation();

  return (
    <span className="inline-flex items-center relative tranlay-">
      <Wifi loading className="translate-y-3/4" />
      <span className="ml-4">{t('Connecting...')}</span>
    </span>
  );
}
