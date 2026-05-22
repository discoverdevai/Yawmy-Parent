import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enChat from './locales/en/chat.json';
import enAttendance from './locales/en/attendance.json';

import arCommon from './locales/ar/common.json';
import arErrors from './locales/ar/errors.json';
import arValidation from './locales/ar/validation.json';
import arAuth from './locales/ar/auth.json';
import arAdmin from './locales/ar/admin.json';
import arChat from './locales/ar/chat.json';
import arAttendance from './locales/ar/attendance.json';

export const SUPPORTED_LOCALES = ['en', 'ar'];
export const DEFAULT_LOCALE = 'en';

export const resources = {
  en: {
    common: enCommon,
    errors: enErrors,
    validation: enValidation,
    auth: enAuth,
    admin: enAdmin,
    chat: enChat,
    attendance: enAttendance,
  },
  ar: {
    common: arCommon,
    errors: arErrors,
    validation: arValidation,
    auth: arAuth,
    admin: arAdmin,
    chat: arChat,
    attendance: arAttendance,
  },
};

export function isRTL(locale) {
  return locale === 'ar';
}

export async function initI18n(locale) {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      resources,
      ns: ['common', 'errors', 'validation', 'auth', 'admin', 'chat', 'attendance'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      returnNull: false,
      compatibilityJSON: 'v3',
    });
  } else if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
  return i18n;
}

export { i18n };
export default i18n;
