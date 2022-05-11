import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { CrossChainPayload } from 'shared/model';

export function ApproveConfirm({ value }: { value: Pick<CrossChainPayload, 'direction' | 'sender'> }) {
  const { t } = useTranslation();

  return (
    <div className="my-4 flex items-center gap-2">
      <div>
        <h4 className="text-gray-400 mb-2">
          <span className="capitalize">
            {t('{{network}} Network Address', { network: value.direction.from?.name })}
          </span>
          :
        </h4>
        <Typography.Text>value.sender</Typography.Text>
      </div>
    </div>
  );
}
