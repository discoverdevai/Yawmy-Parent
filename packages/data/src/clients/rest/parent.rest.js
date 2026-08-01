import { createHttp, HttpError } from './http';
import { fmtDateTime, annScope, eventCategory, preview } from '../../parent-format';

// First image attachment's file URL (announcements carry a mixed attachments[]).
function firstImageUrl(attachments) {
  const a = (attachments ?? []).find(
    (x) => x.type === 'PHOTO' || String(x.contentType ?? '').startsWith('image/'),
  );
  return a?.fileUrl ?? null;
}

function normalizeAnnouncement(dto) {
  return {
    id: dto.id,
    scope: annScope(dto.scope),
    roomName: dto.roomName ?? null,
    title: dto.title,
    body: dto.body,
    preview: preview(dto.body),
    date: fmtDateTime(dto.announcementDate, dto.announcementTime),
    imageUrl: firstImageUrl(dto.attachments),
    seenByMe: !!dto.seenByMe,
  };
}

function normalizeEvent(dto) {
  return {
    id: dto.id,
    category: eventCategory(dto.eventType),
    title: dto.title,
    desc: dto.description,
    place: dto.location ?? '',
    date: fmtDateTime(dto.eventDate, dto.eventTime),
    imageUrl: dto.imageUrl ?? null,
    saved: !!dto.savedByMe,
  };
}

function normalizeNotification(dto) {
  return {
    id: dto.id,
    text: [dto.title, dto.body].filter(Boolean).join(' — '),
    unread: !dto.read,
    type: dto.type,
    entityType: dto.entityType ?? null,
    entityId: dto.entityId ?? null,
    childId: dto.childId ?? null,
    createdAt: dto.createdAt,
  };
}

// ---- Daily-log normalization -----------------------------------------------
// The backend returns a flat DailyLogResponse { logDate, entries[] } where each
// entry has a `category` (MOOD/MEAL/NAP/DIAPER/ACTIVITY/MEDICATION), a LocalTime
// `entryTime`, title/detail, and napMinutes. The daily-log screens consume a
// grouped shape (mood + meals[] + naps[] + …) with ISO datetimes, so we reshape
// here (the parent mock returns the same grouped shape from its seed data).

function combineLocal(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr; // "HH:mm" -> "HH:mm:ss"
  return `${dateStr}T${t}`; // local-naive; new Date() parses in local tz
}

function addMinutesLocal(dateStr, timeStr, minutes) {
  const base = combineLocal(dateStr, timeStr);
  if (!base || minutes == null) return null;
  const d = new Date(base);
  d.setMinutes(d.getMinutes() + minutes);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

function normalizeDailyLog(res) {
  if (!res) return null;
  const entries = res.entries ?? [];
  const of = (cat) => entries.filter((e) => e.category === cat);
  const mood = of('MOOD')[0];
  return {
    logDate: res.logDate,
    mood: mood ? String(mood.title || mood.detail || '').toLowerCase() : null,
    meals: of('MEAL').map((e) => ({
      id: e.id,
      description: e.detail || e.title,
      time: combineLocal(res.logDate, e.entryTime),
    })),
    naps: of('NAP').map((e) => ({
      id: e.id,
      quality: String(e.title || '').toLowerCase(),
      startAt: combineLocal(res.logDate, e.entryTime),
      endAt: addMinutesLocal(res.logDate, e.entryTime, e.napMinutes),
    })),
    diapers: of('DIAPER').map((e) => ({ id: e.id })),
    activities: of('ACTIVITY').map((e) => ({ id: e.id, description: e.detail || e.title })),
    medication: of('MEDICATION').map((e) => ({
      id: e.id,
      drug: e.title || e.detail,
      time: combineLocal(res.logDate, e.entryTime),
    })),
  };
}

// Real REST client for the parent-facing API (`/api/parent/**`). Every call is
// authenticated by the parent's JWT (the backend derives the parent + their
// children from the token), so there is no nursery-scope argument — unlike the
// legacy generic clients. Responses are the backend DTOs, passed through as-is;
// screens/hooks consume those shapes directly (the parent mock mirrors them).
//
// `onUnauthorized` fires on a 401/403 so the app can end the session (the
// backend revokes access by disabling the user).
export function createRestParentClient(baseUrl, { getToken, onUnauthorized } = {}) {
  const http = createHttp(baseUrl, { getToken, onUnauthorized });

  const enc = encodeURIComponent;

  return {
    children: {
      // GET /api/parent/children -> ChildResponse[]
      list: () => http.get('/api/parent/children'),
      // GET /api/parent/children/{id} -> ParentChildDetailResponse
      get: (childId) => http.get(`/api/parent/children/${enc(childId)}`),
    },

    // GET /api/parent/nursery -> NurseryInfoResponse (name, geofence, hours…)
    nursery: () => http.get('/api/parent/nursery'),

    attendance: {
      // GET /api/parent/children/{childId}/attendance?date=YYYY-MM-DD
      get: (childId, date) =>
        http.get(`/api/parent/children/${enc(childId)}/attendance${date ? `?date=${enc(date)}` : ''}`),
      // GET /api/parent/children/{childId}/attendance/history?from=&to=
      history: (childId, from, to) =>
        http.get(
          `/api/parent/children/${enc(childId)}/attendance/history?from=${enc(from)}&to=${enc(to)}`,
        ),
      // POST /api/parent/children/{childId}/attendance/check-in { lat, lng, accuracyM }
      checkIn: (childId, location) =>
        http.post(`/api/parent/children/${enc(childId)}/attendance/check-in`, location),
      // POST /api/parent/children/{childId}/attendance/check-out { lat, lng, accuracyM }
      checkOut: (childId, location) =>
        http.post(`/api/parent/children/${enc(childId)}/attendance/check-out`, location),
    },

    dailyLogs: {
      // GET .../daily-logs?date= -> DailyLogResponse (200) or 404 (no log yet).
      // Returns the grouped shape, or null when there is no published log.
      async get(childId, date) {
        try {
          const res = await http.get(
            `/api/parent/children/${enc(childId)}/daily-logs?date=${enc(date)}`,
          );
          return normalizeDailyLog(res);
        } catch (e) {
          if (e instanceof HttpError && e.status === 404) return null;
          throw e;
        }
      },
      // GET .../daily-logs?from=&to= -> DailyLogSummaryResponse[]
      list: (childId, from, to) =>
        http.get(`/api/parent/children/${enc(childId)}/daily-logs?from=${enc(from)}&to=${enc(to)}`),
    },

    media: {
      // GET .../media[?date= | ?from=&to=] -> MediaItemResponse[]
      list: (childId, params = {}) => {
        const q = params.date
          ? `?date=${enc(params.date)}`
          : params.from && params.to
            ? `?from=${enc(params.from)}&to=${enc(params.to)}`
            : '';
        return http.get(`/api/parent/children/${enc(childId)}/media${q}`);
      },
    },

    schedule: {
      // GET .../schedule?date= -> SessionResponse[]
      // { id, roomId, name, date, startTime, endTime, teacherId, teacherName }
      get: (childId, date) =>
        http.get(`/api/parent/children/${enc(childId)}/schedule?date=${enc(date)}`),
    },

    announcements: {
      // GET /api/parent/announcements -> AnnouncementResponse[] (all scopes)
      async list() {
        const rows = await http.get('/api/parent/announcements');
        return (rows ?? []).map(normalizeAnnouncement);
      },
      async get(id) {
        return normalizeAnnouncement(await http.get(`/api/parent/announcements/${enc(id)}`));
      },
      // POST /api/parent/announcements/{id}/seen -> AnnouncementResponse
      async markSeen(id) {
        return normalizeAnnouncement(await http.post(`/api/parent/announcements/${enc(id)}/seen`, {}));
      },
    },

    events: {
      // GET /api/parent/events?upcoming= -> EventResponse[]
      async list(upcoming = false) {
        const rows = await http.get(`/api/parent/events?upcoming=${upcoming ? 'true' : 'false'}`);
        return (rows ?? []).map(normalizeEvent);
      },
      async listSaved() {
        const rows = await http.get('/api/parent/events/saved');
        return (rows ?? []).map(normalizeEvent);
      },
      save: (id) => http.post(`/api/parent/events/${enc(id)}/save`, {}),
      unsave: (id) => http.del(`/api/parent/events/${enc(id)}/save`),
    },

    incidents: {
      // GET /api/parent/children/{childId}/incidents -> ParentIncidentResponse[]
      listByChild: (childId) => http.get(`/api/parent/children/${enc(childId)}/incidents`),
      get: (incidentId) => http.get(`/api/parent/incidents/${enc(incidentId)}`),
      acknowledge: (incidentId) =>
        http.post(`/api/parent/incidents/${enc(incidentId)}/acknowledge`, {}),
    },

    // In-app notifications (no push server) — the bell + list poll these.
    // These are /api/me/** (current user), reached with the same JWT.
    notifications: {
      async list(status = 'all') {
        const rows = await http.get(`/api/me/notifications?status=${enc(status)}`);
        return (rows ?? []).map(normalizeNotification);
      },
      unreadCount: () => http.get('/api/me/notifications/unread-count'), // { unread }
      async markRead(id) {
        return normalizeNotification(await http.post(`/api/me/notifications/${enc(id)}/read`, {}));
      },
      markAllRead: () => http.post('/api/me/notifications/read-all', {}), // { unread }
      remove: (id) => http.del(`/api/me/notifications/${enc(id)}`),
      removeAll: () => http.del('/api/me/notifications'),
    },

    notificationPreferences: {
      // { quietHoursStart, quietHoursEnd, announcementsEnabled }
      get: () => http.get('/api/me/notification-preferences'),
      // patch: { quietHoursStart?, quietHoursEnd?, announcementsEnabled?, clearQuietHours? }
      update: (patch) => http.patch('/api/me/notification-preferences', patch),
    },
  };
}
