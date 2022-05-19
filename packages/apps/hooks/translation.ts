import { i18n, useTranslation } from 'next-i18next';
import { initReactI18next } from 'react-i18next';

export function useITranslation(namespace = 'common') {
  const { t } = useTranslation(namespace, { i18n: i18n?.use(initReactI18next) });

  return { t };
}
