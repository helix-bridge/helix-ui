import { Breadcrumb } from 'antd';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import { useTranslation } from 'next-i18next';

export function IBreadcrumb({ txHash }: { txHash: string }) {
  const { t } = useTranslation();

  return (
    <Breadcrumb
      className="whitespace-nowrap flex items-center overflow-hidden overflow-ellipsis"
      style={{ marginTop: '1.5rem' }}
    >
      <BreadcrumbItem>{t('Explorer')}</BreadcrumbItem>
      <BreadcrumbItem>{t('Transaction')}</BreadcrumbItem>
      <BreadcrumbItem>
        <span className="w-32 md:w-72 lg:w-96 truncate">{txHash}</span>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
