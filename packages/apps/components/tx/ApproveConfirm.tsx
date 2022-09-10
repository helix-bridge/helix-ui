import { CrossChainPayload } from 'shared/model';
import { useITranslation } from '../../hooks';

export function ApproveConfirm({ value }: { value: Pick<CrossChainPayload, 'direction' | 'sender'> }) {
  const { t } = useITranslation();

  return (
    <div className="my-4 flex items-center gap-2">
      <div>
        <h4 className="text-gray-400 mb-2">
          <span className="capitalize">
            {t('{{network}} Network Address', { network: value.direction.from?.meta.name })}
          </span>
          :
        </h4>
        <span>{value.sender}</span>
      </div>
    </div>
  );
}
