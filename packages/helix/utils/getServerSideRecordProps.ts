import request from 'graphql-request';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ENDPOINT } from 'shared/config/env';
import { HelixHistoryRecord } from 'shared/model';
import { gqlName } from 'shared/utils/helper';
import { HISTORY_RECORD_BY_ID } from '../config';

export async function getServerSideRecordProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
  const translations = await serverSideTranslations(context.locale ?? 'en', ['common']);
  const { id } = context.params!;
  const result = await request(ENDPOINT, HISTORY_RECORD_BY_ID, { id });

  return {
    props: {
      ...translations,
      id,
      data: result[gqlName(HISTORY_RECORD_BY_ID)],
    },
  };
}
