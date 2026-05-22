import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicNumerals(value) {
  return String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function formatDate(value, locale = 'en', pattern = 'LL') {
  const d = dayjs(value).locale(locale);
  const formatted = d.format(pattern);
  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

export function formatTime(value, locale = 'en', pattern = 'HH:mm') {
  const formatted = dayjs(value).locale(locale).format(pattern);
  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

export function formatRelative(value, locale = 'en') {
  const formatted = dayjs(value).locale(locale).fromNow();
  return locale === 'ar' ? toArabicNumerals(formatted) : formatted;
}

export function formatNumber(value, locale = 'en', options) {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', options).format(value);
  } catch {
    return String(value);
  }
}
