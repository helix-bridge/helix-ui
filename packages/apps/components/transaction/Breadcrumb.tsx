import { Breadcrumb } from 'antd';
import { useTranslation } from 'next-i18next';

export function IBreadcrumb({ txHash }: { txHash?: string }) {
  const { t } = useTranslation();

  return (
    <Breadcrumb
      className="whitespace-nowrap flex items-center overflow-hidden overflow-ellipsis"
      style={{ marginTop: '1.5rem' }}
    >
      <Breadcrumb.Item>{t('Explorer')}</Breadcrumb.Item>
      <Breadcrumb.Item>{t('Transaction')}</Breadcrumb.Item>
      <Breadcrumb.Item>
        <span className="w-32 md:w-72 lg:w-96 truncate">{txHash}</span>
      </Breadcrumb.Item>
    </Breadcrumb>
  );
}
