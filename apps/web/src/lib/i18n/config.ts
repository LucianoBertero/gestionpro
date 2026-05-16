import i18next from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

const DEFAULT_NS = 'common';
const FALLBACK_LNG = 'es-AR';

export const SUPPORTED_LANGUAGES = [
  { code: 'es-AR', label: 'Español (AR)' },
  { code: 'en-US', label: 'English (US)' },
] as const;

i18next
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`@/locales/${language}/${namespace}.json`),
    ),
  )
  .use(initReactI18next)
  .init({
    defaultNS: DEFAULT_NS,
    fallbackLng: FALLBACK_LNG,
    lng: FALLBACK_LNG,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

export default i18next;
