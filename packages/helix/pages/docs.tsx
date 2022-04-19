import { Result, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function Page() {
  const { t } = useTranslation();
  return (
    <Result
      subTitle={t('Coming soon')}
      style={{ minHeight: 'calc(100vh - 2 * 64px - 148px)' }}
      extra={<Button type="primary">{t('Back')}</Button>}
    />
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default Page;
