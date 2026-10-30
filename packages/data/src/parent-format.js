// Shared shaping helpers for the parent app. Both the REST client (backend
// DTOs) and the mock (seed DB) use these so the app-facing shapes match.

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// (dateStr "YYYY-MM-DD", timeStr "HH:mm[:ss]") -> "Mar 30 - 10:30 PM".
// Accepts a full ISO datetime in dateStr when timeStr is omitted.
export function fmtDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  let d;
  if (timeStr) {
    const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    d = new Date(`${dateStr}T${t}`);
  } else {
    d = new Date(dateStr);
  }
  if (Number.isNaN(d.getTime())) return String(dateStr);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()} - ${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

// Backend AnnouncementScope (NURSERY|ROOM) -> app tab id.
export function annScope(scope) {
  return String(scope ?? '').toUpperCase() === 'ROOM' ? 'room' : 'nursery';
}

// Backend EventType -> the coral category chip label.
const EVENT_CATEGORY = {
  HOLIDAY: 'Holiday',
  PARENT_TEACHER_MEETING: 'Parent Meeting',
  ONE_TIME: 'Event',
  RECURRING: 'Event',
};
export function eventCategory(type) {
  return EVENT_CATEGORY[type] ?? 'Event';
}

// Short single-line preview from a longer body.
export function preview(body, n = 120) {
  const s = String(body ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

/**
 * Today (or `date`) as "YYYY-MM-DD" in the device's local time zone.
 *
 * `new Date().toISOString().slice(0, 10)` gives the UTC date, which in Cairo is
 * still yesterday between midnight and about 3 a.m. — so attendance and the
 * daily log were read for the wrong day.
 */
export function localYmd(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
