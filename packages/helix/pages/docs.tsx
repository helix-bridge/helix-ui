import { Result, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function Page() {
  const { t } = useTranslation();
  return (
    <Result status="404" title="404" subTitle={t('Coming soon')} extra={<Button type="primary">{t('Back')}</Button>} />
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
