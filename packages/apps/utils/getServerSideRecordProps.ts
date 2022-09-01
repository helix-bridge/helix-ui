import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HelixHistoryRecord } from 'shared/model';

export async function getServerSideRecordProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  const translations = await serverSideTranslations(context.locale ?? 'en', ['common']);
  const { id } = context.params!;

  return {
    props: {
      ...translations,
      id,
    },
  };
}
