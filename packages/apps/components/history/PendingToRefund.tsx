import { Button } from 'antd';
import { useITranslation } from '../../hooks';
import { RecordStatusComponentProps } from '../../model/component';

export function PendingToRefund(_: RecordStatusComponentProps) {
  const { t } = useITranslation();

  return <Button size="small">{t('Refund')}</Button>;
}
