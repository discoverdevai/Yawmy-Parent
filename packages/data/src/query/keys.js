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
};
