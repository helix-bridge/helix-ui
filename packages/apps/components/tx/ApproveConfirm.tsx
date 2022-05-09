import { CrossChainPayload } from 'shared/model';
import { useTranslation } from 'react-i18next';
import { IDescription } from '../widget/IDescription';

export function ApproveConfirm({ value }: { value: Pick<CrossChainPayload, 'direction' | 'sender'> }) {
  const { t } = useTranslation();

  return (
    <IDescription
      title={
        <span className="capitalize">{t('{{network}} Network Address', { network: value.direction.from?.name })}</span>
      }
      content={value.sender}
    ></IDescription>
  );
}
