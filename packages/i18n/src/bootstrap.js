import { initI18n, SUPPORTED_LOCALES, DEFAULT_LOCALE, isRTL } from './index';
import { ensureLayoutDirection } from './rtl';

let mmkvStore = null;
try {
  const { MMKV } = require('react-native-mmkv');
  mmkvStore = new MMKV({ id: 'nms.locale' });
} catch {
  mmkvStore = null;
}

const STORED_LOCALE_KEY = 'locale';

function readStoredLocale() {
  const raw = mmkvStore?.getString(STORED_LOCALE_KEY);
  if (raw && SUPPORTED_LOCALES.includes(raw)) return raw;
  return null;
}

export function persistLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  mmkvStore?.set(STORED_LOCALE_KEY, locale);
}

function detectDeviceLocale() {
  try {
    const Localization = require('expo-localization');
    const locales = Localization.getLocales?.() ?? [];
    const code = locales[0]?.languageCode;
    if (code && SUPPORTED_LOCALES.includes(code)) return code;
  } catch {
    /* fall through */
  }
  return DEFAULT_LOCALE;
}

/**
 * Boots i18n + RTL alignment. Call this from the root _layout BEFORE rendering
 * any screen and BEFORE hiding the splash. Returns the resolved locale.
 *
 * @returns {Promise<{ locale: 'en'|'ar', reloading: boolean }>}
 */
export async function bootstrapI18n() {
  const locale = readStoredLocale() ?? detectDeviceLocale();
  await initI18n(locale);
  const { reloaded } = await ensureLayoutDirection({ targetIsRTL: isRTL(locale) });
  return { locale, reloading: reloaded };
}

/**
 * Switches the user's locale. Persists the choice and triggers a reload if
 * the layout direction needs to flip.
 *
 * @param {'en'|'ar'} nextLocale
 */
export async function changeLocale(nextLocale) {
  if (!SUPPORTED_LOCALES.includes(nextLocale)) {
    throw new Error(`Unsupported locale: ${nextLocale}`);
  }
  persistLocale(nextLocale);
  await initI18n(nextLocale);
  return ensureLayoutDirection({ targetIsRTL: isRTL(nextLocale) });
}
