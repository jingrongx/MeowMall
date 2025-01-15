import { InitOptions } from 'i18next';

export const defaultNS = 'common';
export const fallbackLng = 'en';

export function getOptions(lng = fallbackLng, ns = defaultNS): InitOptions {
  return {
    supportedLngs: ['en', 'zh'],
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    interpolation: {
      escapeValue: false,
    },
  };
}