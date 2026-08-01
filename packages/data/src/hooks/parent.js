// Parent-app data hooks. Unlike the generic hooks, these do NOT use a tenant
// scope — the backend parent API derives the parent + their children from the
// JWT, so the queries are keyed by ['parent', …] and take only childId/date.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { qk } from '../query/keys';

export function useParentChildren() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.children(),
    queryFn: () => api.parent.children.list(),
  });
}

export function useParentChild(childId) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.child(childId),
    queryFn: () => api.parent.children.get(childId),
    enabled: !!childId,
  });
}

export function useParentNursery() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.nursery(),
    queryFn: () => api.parent.nursery(),
  });
}

export function useChildAttendance(childId, date) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.attendance(childId, date),
    queryFn: () => api.parent.attendance.get(childId, date),
    enabled: !!childId,
  });
}

export function useChildAttendanceHistory(childId, from, to) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.attendanceHistory(childId, from, to),
    queryFn: () => api.parent.attendance.history(childId, from, to),
    enabled: !!childId && !!from && !!to,
  });
}

export function useChildDailyLog(childId, date) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.dailyLog(childId, date),
    queryFn: () => api.parent.dailyLogs.get(childId, date),
    enabled: !!childId && !!date,
  });
}

export function useChildDailyLogs(childId, from, to) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.dailyLogs(childId, from, to),
    queryFn: () => api.parent.dailyLogs.list(childId, from, to),
    enabled: !!childId && !!from && !!to,
  });
}

export function useChildMedia(childId, date) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.media(childId, date),
    queryFn: () => api.parent.media.list(childId, date ? { date } : {}),
    enabled: !!childId,
  });
}

export function useChildSchedule(childId, date) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.schedule(childId, date),
    queryFn: () => api.parent.schedule.get(childId, date),
    enabled: !!childId && !!date,
  });
}

// ---- Announcements ---------------------------------------------------------
// NB: names are Parent-prefixed to avoid colliding with the scope-based
// hooks/announcements.js + events.js + incidents.js in the shared barrel
// (on a re-export name clash the first `export *` wins, which would silently
// shadow these with the TenantScope versions and crash under parent auth).
export function useParentAnnouncements() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.announcements(),
    queryFn: () => api.parent.announcements.list(),
  });
}

export function useAnnouncement(id) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.announcement(id),
    queryFn: () => api.parent.announcements.get(id),
    enabled: !!id,
  });
}

export function useMarkAnnouncementSeen() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.parent.announcements.markSeen(id),
    onSuccess: (res, id) => {
      if (res) qc.setQueryData(qk.parent.announcement(id), res);
      qc.invalidateQueries({ queryKey: qk.parent.announcements() });
    },
  });
}

// ---- Events ----------------------------------------------------------------
export function useParentEvents(upcoming = false) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.events(upcoming),
    queryFn: () => api.parent.events.list(upcoming),
  });
}

export function useSavedEvents() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.eventsSaved(),
    queryFn: () => api.parent.events.listSaved(),
  });
}

export function useToggleSaveEvent() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }) =>
      saved ? api.parent.events.unsave(id) : api.parent.events.save(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent', 'events'], exact: false }),
  });
}

// ---- Incidents -------------------------------------------------------------
export function useChildIncidents(childId) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.incidents(childId),
    queryFn: () => api.parent.incidents.listByChild(childId),
    enabled: !!childId,
  });
}

export function useParentIncident(id) {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.incident(id),
    queryFn: () => api.parent.incidents.get(id),
    enabled: !!id,
  });
}

export function useAcknowledgeIncident() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.parent.incidents.acknowledge(id),
    onSuccess: (res, id) => {
      if (res) qc.setQueryData(qk.parent.incident(id), res);
      qc.invalidateQueries({ queryKey: ['parent', 'children'], exact: false });
    },
  });
}

// ---- Notifications (in-app, polled — no push server) -----------------------
export function useNotifications(status = 'all') {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.notifications(status),
    queryFn: () => api.parent.notifications.list(status),
    // Poll so newly-created notifications surface without a push channel.
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationCount() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.notificationsUnread(),
    queryFn: () => api.parent.notifications.unreadCount(),
    refetchInterval: 60_000,
    select: (r) => r?.unread ?? 0,
  });
}

function invalidateNotifications(qc) {
  qc.invalidateQueries({ queryKey: ['parent', 'notifications'], exact: false });
}

export function useMarkNotificationRead() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.parent.notifications.markRead(id),
    onSuccess: () => invalidateNotifications(qc),
  });
}

export function useMarkAllNotificationsRead() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.parent.notifications.markAllRead(),
    onSuccess: () => invalidateNotifications(qc),
  });
}

export function useDeleteNotification() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.parent.notifications.remove(id),
    onSuccess: () => invalidateNotifications(qc),
  });
}

export function useDeleteAllNotifications() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.parent.notifications.removeAll(),
    onSuccess: () => invalidateNotifications(qc),
  });
}

export function useNotificationPreferences() {
  const api = useApi();
  return useQuery({
    queryKey: qk.parent.notificationPrefs(),
    queryFn: () => api.parent.notificationPreferences.get(),
  });
}

export function useUpdateNotificationPreferences() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch) => api.parent.notificationPreferences.update(patch),
    onSuccess: (res) => {
      if (res) qc.setQueryData(qk.parent.notificationPrefs(), res);
    },
  });
}

export function useParentCheckIn() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ childId, location }) => api.parent.attendance.checkIn(childId, location),
    onSuccess: (res, { childId }) => {
      // Seed the day's attendance from the response so the UI flips to the
      // checked-in view immediately, then refresh history in the background.
      if (res?.date) qc.setQueryData(qk.parent.attendance(childId, res.date), res);
      qc.invalidateQueries({ queryKey: ['parent', 'children', childId, 'attendance'], exact: false });
    },
  });
}

export function useParentCheckOut() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ childId, location }) => api.parent.attendance.checkOut(childId, location),
    onSuccess: (res, { childId }) => {
      if (res?.date) qc.setQueryData(qk.parent.attendance(childId, res.date), res);
      qc.invalidateQueries({ queryKey: ['parent', 'children', childId, 'attendance'], exact: false });
    },
  });
}
