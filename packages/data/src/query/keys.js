// Query-key factory. Every key is namespaced by ['nursery', nurseryId, ...] so
// switching tenants (Phase 4) cannot leak cached data between nurseries.

const ns = (nurseryId, ...rest) => ['nursery', nurseryId, ...rest];

export const qk = {
  session: () => ['session'],
  nursery: {
    profile: (n) => ns(n, 'profile'),
  },
  rooms: {
    all: (n) => ns(n, 'rooms'),
    detail: (n, id) => ns(n, 'rooms', id),
  },
  children: {
    all: (n) => ns(n, 'children'),
    list: (n, params) => ns(n, 'children', 'list', params ?? {}),
    detail: (n, id) => ns(n, 'children', id),
  },
  users: {
    all: (n) => ns(n, 'users'),
  },
  attendance: {
    today: (n, roomId) => ns(n, 'attendance', 'today', roomId ?? '*'),
    list: (n, params) => ns(n, 'attendance', 'list', params ?? {}),
  },
  incidents: {
    all: (n) => ns(n, 'incidents'),
    detail: (n, id) => ns(n, 'incidents', id),
  },
  announcements: {
    all: (n) => ns(n, 'announcements'),
    seenBy: (n, id) => ns(n, 'announcements', id, 'seenBy'),
  },
  events: {
    all: (n) => ns(n, 'events'),
    detail: (n, id) => ns(n, 'events', id),
  },
  chat: {
    threads: (n) => ns(n, 'chat', 'threads'),
    messages: (n, threadId) => ns(n, 'chat', 'messages', threadId),
  },
  export: {
    job: (n, jobId) => ns(n, 'export', 'job', jobId),
  },
  dailyLogs: {
    byChild: (n, childId) => ns(n, 'daily-logs', 'by-child', childId),
    onDate: (n, childId, date) => ns(n, 'daily-logs', 'on-date', childId, date),
  },
  // Parent app keys. The backend parent API is keyed by the JWT (+ childId),
  // not a nursery scope, so these live under a flat ['parent', …] namespace.
  parent: {
    children: () => ['parent', 'children'],
    child: (childId) => ['parent', 'children', childId],
    nursery: () => ['parent', 'nursery'],
    attendance: (childId, date) => ['parent', 'children', childId, 'attendance', date ?? 'today'],
    attendanceHistory: (childId, from, to) => [
      'parent', 'children', childId, 'attendance', 'history', from ?? '', to ?? '',
    ],
    dailyLog: (childId, date) => ['parent', 'children', childId, 'daily-log', date ?? 'today'],
    dailyLogs: (childId, from, to) => [
      'parent', 'children', childId, 'daily-logs', from ?? '', to ?? '',
    ],
    media: (childId, date) => ['parent', 'children', childId, 'media', date ?? 'all'],
    schedule: (childId, date) => ['parent', 'children', childId, 'schedule', date ?? 'today'],
    announcements: () => ['parent', 'announcements'],
    announcement: (id) => ['parent', 'announcements', id],
    events: (upcoming) => ['parent', 'events', upcoming ? 'upcoming' : 'all'],
    eventsSaved: () => ['parent', 'events', 'saved'],
    incidents: (childId) => ['parent', 'children', childId, 'incidents'],
    incident: (id) => ['parent', 'incidents', id],
    notifications: (status) => ['parent', 'notifications', status ?? 'all'],
    notificationsUnread: () => ['parent', 'notifications', 'unread-count'],
    notificationPrefs: () => ['parent', 'notification-preferences'],
    // Keyed by child: the directory is derived from that child's room, so a
    // different child is a different list rather than a filter over one cache.
    chatDirectory: (childId) => ['parent', 'chat', 'directory', childId ?? 'none'],
    chatMessages: (threadId) => ['parent', 'chat', 'messages', threadId],
    chatMutes: () => ['parent', 'chat', 'mutes'],
  },
};
