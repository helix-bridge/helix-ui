import { Breadcrumb } from 'antd';
import BreadcrumbItem from 'antd/lib/breadcrumb/BreadcrumbItem';
import { useTranslation } from 'next-i18next';
import { EllipsisMiddle } from 'shared/components/widget/EllipsisMiddle';

export function IBreadcrumb({ txHash }: { txHash: string }) {
  const { t } = useTranslation();

  return (
    <Breadcrumb className="whitespace-nowrap flex items-center overflow-hidden overflow-ellipsis">
      <BreadcrumbItem>{t('Explorer')}</BreadcrumbItem>
      <BreadcrumbItem>{t('Transaction')}</BreadcrumbItem>
      <BreadcrumbItem>
        <EllipsisMiddle className="w-32 md:w-72 lg:w-96">{txHash}</EllipsisMiddle>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
