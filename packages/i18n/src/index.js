import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enChat from './locales/en/chat.json';
import enAttendance from './locales/en/attendance.json';
import enNotifications from './locales/en/notifications.json';
import enAnnouncement from './locales/en/announcement.json';
import enEvent from './locales/en/event.json';
import enProfile from './locales/en/profile.json';
import enMedia from './locales/en/media.json';
import enSettings from './locales/en/settings.json';

import arCommon from './locales/ar/common.json';
import arErrors from './locales/ar/errors.json';
import arValidation from './locales/ar/validation.json';
import arAuth from './locales/ar/auth.json';
import arAdmin from './locales/ar/admin.json';
import arChat from './locales/ar/chat.json';
import arAttendance from './locales/ar/attendance.json';
import arNotifications from './locales/ar/notifications.json';
import arAnnouncement from './locales/ar/announcement.json';
import arEvent from './locales/ar/event.json';
import arProfile from './locales/ar/profile.json';
import arMedia from './locales/ar/media.json';
import arSettings from './locales/ar/settings.json';

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
    notifications: enNotifications,
    announcement: enAnnouncement,
    event: enEvent,
    profile: enProfile,
    media: enMedia,
    settings: enSettings,
  },
  ar: {
    common: arCommon,
    errors: arErrors,
    validation: arValidation,
    auth: arAuth,
    admin: arAdmin,
    chat: arChat,
    attendance: arAttendance,
    notifications: arNotifications,
    announcement: arAnnouncement,
    event: arEvent,
    profile: arProfile,
    media: arMedia,
    settings: arSettings,
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
      ns: [
        'common',
        'errors',
        'validation',
        'auth',
        'admin',
        'chat',
        'attendance',
        'notifications',
        'announcement',
        'event',
        'profile',
        'media',
        'settings',
      ],
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
