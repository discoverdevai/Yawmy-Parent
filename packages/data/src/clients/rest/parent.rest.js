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
  // The structured answers (mood, mealAmount, napQuality, nap start/end) are the
  // source of truth; the backend also sends them worded for display (*Label).
  // Reading the free-text title instead used to show a teacher's custom title as
  // the mood, every nap as "Light Sleep", and never the meal amount.
  return {
    logDate: res.logDate,
    mood: mood ? mood.moodLabel || mood.title || mood.detail || null : null,
    moodKey: mood?.mood ? String(mood.mood).toLowerCase() : null,
    meals: of('MEAL').map((e) => ({
      id: e.id,
      description: [e.title || e.detail, e.mealAmountLabel].filter(Boolean).join(' · '),
      amount: e.mealAmount ?? null,
      amountLabel: e.mealAmountLabel ?? null,
      time: combineLocal(res.logDate, e.entryTime),
    })),
    naps: of('NAP').map((e) => ({
      id: e.id,
      quality: e.napQuality ? String(e.napQuality).toLowerCase() : null,
      qualityLabel: e.napQualityLabel || e.title || null,
      startAt: combineLocal(res.logDate, e.napStartTime || e.entryTime),
      endAt: e.napEndTime
        ? combineLocal(res.logDate, e.napEndTime)
        : addMinutesLocal(res.logDate, e.entryTime, e.napMinutes),
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
export function createRestParentClient(baseUrl, { getToken, onUnauthorized, refreshAuth } = {}) {
  const http = createHttp(baseUrl, { getToken, onUnauthorized, refreshAuth });

  const enc = encodeURIComponent;

  // The backend returns file paths relative to its own root ("/api/files/…").
  // Resolving them here, against the base URL this client was built with, keeps
  // screens from having to know where the API lives.
  const fileUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${String(baseUrl).replace(/\/+$/, '')}${path}`;
  };

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
        http.get(
          `/api/parent/children/${enc(childId)}/attendance${date ? `?date=${enc(date)}` : ''}`,
        ),
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
        return normalizeAnnouncement(
          await http.post(`/api/parent/announcements/${enc(id)}/seen`, {}),
        );
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

    // ---- chat ---------------------------------------------------------------
    // The chat list is a *directory* the backend derives from who the parent is
    // related to right now: the nursery office, and — for the selected child —
    // that child's room group and the teachers who actually teach it. Rows with
    // no `threadId` are contacts nobody has messaged yet.
    //
    // That derivation is why switching child must re-fetch rather than filter,
    // and why a child moving room silently changes the list with nothing to
    // clean up.
    chat: {
      // GET /api/me/chat/directory?childId= -> ChatDirectoryEntry[]
      async directory(childId) {
        const rows = await http.get(
          `/api/me/chat/directory${childId ? `?childId=${enc(childId)}` : ''}`,
        );
        return (rows ?? []).map((dto) => normalizeDirectoryEntry(dto, fileUrl));
      },

      /** Bound to this client's base URL, so screens need not resolve file paths. */
      normalizeMessage: (dto, myUserId) => normalizeChatMessage(dto, myUserId, fileUrl),

      /**
       * The thread behind a directory row, created on first use. Which endpoint
       * opens it depends on the row's kind, which the caller should not have to
       * know — it holds a contact, not a thread.
       */
      async ensureThread(entry) {
        if (entry.threadId) return entry.threadId;
        let detail;
        switch (entry.kind) {
          case 'ADMIN_SUPPORT':
            // No admin id: the parent talks to "the nursery", and whichever
            // admin is on shift answers in the same thread.
            detail = await http.post('/api/parent/chat/threads/admin', {});
            break;
          case 'DIRECT':
            detail = await http.post(
              `/api/parent/chat/threads/teacher/${enc(entry.peerUserId)}`,
              {},
            );
            break;
          case 'ROOM_GROUP':
            // Room groups are created with the room and reconciled at every
            // boot, so a parent never opens one — reaching here is a real fault.
            throw new Error('This room has no group chat yet. Try again in a moment.');
          default:
            throw new Error(`Unknown chat kind: ${entry.kind}`);
        }
        return detail?.id ?? null;
      },

      thread: (threadId) => http.get(`/api/me/chat/threads/${enc(threadId)}`),

      /**
       * A page of messages, always oldest-first however it was fetched.
       *
       * `before` pages backwards for scroll-up — the backend answers
       * newest-first, and a screen rendering top-to-bottom would show that page
       * upside down. `after` asks what has arrived since a point in time and is
       * already ascending; that one is the socket-is-down fallback.
       */
      async messages(threadId, { before, after, limit = 50 } = {}) {
        const params = new URLSearchParams();
        if (before) params.set('before', before);
        if (after) params.set('after', after);
        params.set('limit', String(limit));
        const rows = await http.get(
          `/api/me/chat/threads/${enc(threadId)}/messages?${params.toString()}`,
        );
        const list = rows ?? [];
        return after ? list : [...list].reverse();
      },

      send: (threadId, { body, replyToMessageId, attachmentMediaIds } = {}) =>
        http.post(`/api/me/chat/threads/${enc(threadId)}/messages`, {
          body: body ?? null,
          replyToMessageId: replyToMessageId ?? null,
          attachmentMediaIds: attachmentMediaIds ?? null,
        }),

      markRead: (threadId, lastReadMessageId) =>
        http.post(`/api/me/chat/threads/${enc(threadId)}/read`, { lastReadMessageId }),

      setThreadMuted: (threadId, muted) =>
        http.patch(`/api/me/chat/threads/${enc(threadId)}`, { muted }),

      addReaction: (messageId, emoji) =>
        http.post(`/api/me/chat/messages/${enc(messageId)}/reactions`, { emoji }),

      removeReaction: (messageId, emoji) =>
        http.del(`/api/me/chat/messages/${enc(messageId)}/reactions?emoji=${enc(emoji)}`),

      /** Removes the message for everyone. The backend allows this to the sender only. */
      deleteForEveryone: (messageId) => http.del(`/api/me/chat/messages/${enc(messageId)}`),

      /** Hides the message for this parent only; nobody else's copy changes. */
      hideForMe: (messageId) => http.post(`/api/me/chat/messages/${enc(messageId)}/hide`, {}),
      unhideForMe: (messageId) => http.del(`/api/me/chat/messages/${enc(messageId)}/hide`),

      // Muting a person suppresses notifications about them. Their messages
      // still appear in the thread — this stops the interruption, it does not
      // silence the speaker.
      muteUser: (userId) => http.post(`/api/me/chat/mutes/${enc(userId)}`, {}),
      unmuteUser: (userId) => http.del(`/api/me/chat/mutes/${enc(userId)}`),
      async mutedUserIds() {
        return (await http.get('/api/me/chat/mutes')) ?? [];
      },

      /**
       * Upload attachments, then send a message referencing the returned ids.
       * Two steps by design: a half-finished upload never becomes a
       * half-finished message.
       */
      uploadMedia(files, { durationMs } = {}) {
        const form = new FormData();
        files.forEach((file) => {
          form.append('files', {
            uri: file.uri,
            name: file.name || guessName(file),
            type: file.mimeType || guessMime(file),
          });
        });
        if (durationMs != null) form.append('durationMs', String(Math.round(durationMs)));
        return http.postForm('/api/me/chat/media', form);
      },
    },
  };
}

// ---- chat normalisation ------------------------------------------------------

export function normalizeDirectoryEntry(dto, fileUrl = (p) => p) {
  return {
    kind: dto.kind, // DIRECT | ROOM_GROUP | STAFF_GROUP | ADMIN_SUPPORT
    peerUserId: dto.peerUserId ?? null,
    peerRole: dto.peerRole ?? null,
    roomId: dto.roomId ?? null,
    title: dto.title,
    subtitle: dto.subtitle ?? '',
    avatarUrl: fileUrl(dto.avatarUrl),
    threadId: dto.threadId ?? null,
    preview: dto.lastMessagePreview ?? '',
    lastMessageAt: dto.lastMessageAt ?? null,
    unread: dto.unreadCount ?? 0,
    muted: !!dto.muted,
    isGroup: dto.kind === 'ROOM_GROUP' || dto.kind === 'STAFF_GROUP',
  };
}

/**
 * Backend message DTO → the shape the conversation screen renders.
 *
 * A message carries text, attachments, or both, so `type` follows from what is
 * actually attached rather than a field the sender set. `mine` needs the
 * viewer's id, which the DTO deliberately does not assume.
 */
export function normalizeChatMessage(dto, myUserId, fileUrl = (p) => p) {
  const attachments = (dto.attachments ?? []).map((a) => ({
    id: a.id,
    type: a.type, // PHOTO | VIDEO | DOCUMENT | AUDIO
    uri: fileUrl(a.fileUrl),
    contentType: a.contentType,
    filename: a.filename ?? null,
    sizeBytes: a.sizeBytes ?? 0,
    durationMs: a.durationMs ?? null,
  }));
  const voice = attachments.find((a) => a.type === 'AUDIO');
  const firstVisual = attachments.find((a) => a.type === 'PHOTO' || a.type === 'VIDEO');
  const firstDoc = attachments.find((a) => a.type === 'DOCUMENT');

  let type = 'text';
  if (voice) type = 'voice';
  else if (firstVisual) type = firstVisual.type === 'VIDEO' ? 'video' : 'image';
  else if (firstDoc) type = 'document';

  const createdAt = dto.createdAt ? new Date(dto.createdAt) : new Date();
  return {
    id: dto.id,
    mine: dto.senderId === myUserId,
    senderId: dto.senderId,
    senderName: dto.senderName,
    type,
    text: dto.body ?? '',
    attachments,
    uri: voice?.uri ?? firstVisual?.uri ?? firstDoc?.uri ?? null,
    duration: voice?.durationMs ? Math.round(voice.durationMs / 1000) : null,
    replyTo: dto.replyToMessageId
      ? { id: dto.replyToMessageId, text: dto.replyToPreview ?? '' }
      : null,
    reactions: dto.reactions ?? {},
    outOfHours: !!dto.outOfHours,
    createdAt: dto.createdAt,
    date: createdAt,
    time: clockOf(createdAt),
    pending: false,
    failed: false,
  };
}

function clockOf(date) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

function extensionOf(uri) {
  const clean = String(uri || '').split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function guessName(file) {
  const fromUri = String(file.uri || '')
    .split('/')
    .pop();
  return fromUri && fromUri.includes('.') ? fromUri : `upload-${Date.now()}`;
}

// The picker does not always report a MIME type, and the backend rejects
// anything it cannot classify — so fall back to the extension rather than
// sending a file that is certain to bounce.
const MIME_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4a: 'audio/m4a',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function guessMime(file) {
  return MIME_BY_EXT[extensionOf(file.uri)] || 'application/octet-stream';
}
