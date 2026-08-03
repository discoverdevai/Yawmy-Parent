import { newId } from './db';
import { NotFoundError } from '../errors';
import { fmtDateTime, preview } from '../parent-format';
import { createParentChatMock } from './parent-chat.mock';

// Mock parent client — mirrors the backend `/api/parent/**` DTO shapes so the
// parent screens behave identically in mock mode and against the real backend.
// The "current parent" is runtime.activeUserId (set by the auth mock on sign-in),
// and their children are those whose guardianIds include that id.

const TZ = 'Africa/Cairo';

export function createParentMock(db, runtime) {
  // Per-session client state the seed DB doesn't track.
  const savedEvents = new Set();
  const seenAnnouncements = new Set();
  const readNotifications = new Set();
  const deletedNotifications = new Set();
  let prefs = { quietHoursStart: null, quietHoursEnd: null, announcementsEnabled: true };

  function currentParent() {
    const id = runtime.activeUserId;
    const user = id ? db.users.find((u) => u.id === id) : null;
    if (!user) throw new NotFoundError('No active parent session');
    return user;
  }

  function roomName(roomId) {
    return db.rooms.find((r) => r.id === roomId)?.name ?? null;
  }

  function myChildren() {
    const parent = currentParent();
    return db.children.filter((c) => (c.guardianIds ?? []).includes(parent.id));
  }

  function requireChild(childId) {
    const child = myChildren().find((c) => c.id === childId);
    if (!child) throw new NotFoundError('Child not found');
    return child;
  }

  function toChildResponse(child) {
    return {
      id: child.id,
      fullName: child.name,
      dob: String(child.dateOfBirth ?? '').slice(0, 10) || null,
      roomId: child.roomId,
      roomName: roomName(child.roomId),
      photoUrl: child.photoUrl ?? null,
      allergies: (child.allergies ?? []).join(', '),
      medicalNotes: child.medicalNotes ?? '',
      immunizations: (child.immunization ?? []).join(', '),
      enrollmentStatus: child.enrolled ? 'ENROLLED' : 'UNENROLLED',
      unenrolledAt: null,
      createdAt: child.createdAt,
      updatedAt: child.createdAt,
    };
  }

  function attendanceFor(childId, date) {
    const today = new Date().toISOString().slice(0, 10);
    // Mock DB only tracks today's attendance; a past date returns NOT_ARRIVED.
    const rec = date && date !== today
      ? null
      : db.attendance.find((a) => a.childId === childId);
    let status = 'NOT_ARRIVED';
    if (rec) status = rec.checkOutAt ? 'CHECKED_OUT' : 'PRESENT';
    return { rec, status, date: date ?? today };
  }

  function toAttendanceResponse(child, childId, date) {
    const { rec, status, date: on } = attendanceFor(childId, date);
    return {
      childId,
      childName: child.name,
      photoUrl: child.photoUrl ?? null,
      roomId: child.roomId,
      roomName: roomName(child.roomId),
      date: on,
      status,
      lastCheckInAt: rec?.checkInAt ?? null,
      lastCheckOutAt: rec?.checkOutAt ?? null,
      events: [],
    };
  }

  function toAnnouncement(a, parentId) {
    const scope = a.scope?.kind === 'rooms' ? 'room' : 'nursery';
    const roomId = a.scope?.roomIds?.[0];
    const body = a.content?.body ?? '';
    return {
      id: a.id,
      scope,
      roomName: roomId ? roomName(roomId) : null,
      title: a.title,
      body,
      preview: preview(body),
      date: fmtDateTime(a.publishedAt),
      imageUrl: a.content?.imageUrls?.[0] ?? null,
      seenByMe: seenAnnouncements.has(a.id) || (a.seenByUserIds ?? []).includes(parentId),
    };
  }

  function toEvent(e) {
    const category =
      e.kind === 'holiday' ? 'Holiday' : e.kind === 'parentMeeting' ? 'Parent Meeting' : 'Event';
    return {
      id: e.id,
      category,
      title: e.title,
      desc: e.description ?? '',
      place: 'At Nursery',
      date: fmtDateTime(e.startsAt),
      imageUrl: `https://picsum.photos/seed/event-${e.id}/600/400`,
      saved: savedEvents.has(e.id),
    };
  }

  function toIncident(inc, child) {
    return {
      id: inc.id,
      childId: inc.childId,
      childName: child?.name ?? null,
      incidentAt: inc.occurredAt,
      incidentType: inc.incidentType ?? 'Incident',
      description: inc.description,
      actionTaken: inc.actionTaken,
      injuryArea: inc.bodyArea ?? null,
      authorName: db.users.find((u) => u.id === inc.reportedBy)?.name ?? null,
      acknowledged: !!inc.parentAcknowledgedAt,
      acknowledgedAt: inc.parentAcknowledgedAt ?? null,
      createdAt: inc.createdAt,
    };
  }

  // Synthesize notifications from seed announcements + incidents for the parent.
  function buildNotifications() {
    const parent = currentParent();
    const childIds = myChildren().map((c) => c.id);
    const list = [];
    for (const a of db.announcements.filter((x) => x.nurseryId === parent.nurseryId && x.publishedAt)) {
      list.push({
        id: `ntf_ann_${a.id}`,
        type: 'ANNOUNCEMENT_PUBLISHED',
        title: a.title,
        body: preview(a.content?.body, 60),
        entityType: 'ANNOUNCEMENT',
        entityId: a.id,
        childId: null,
        createdAt: a.publishedAt,
      });
    }
    for (const i of db.incidents.filter((x) => childIds.includes(x.childId))) {
      list.push({
        id: `ntf_inc_${i.id}`,
        type: 'INCIDENT_REPORTED',
        title: 'Incident reported',
        body: i.description,
        entityType: 'INCIDENT',
        entityId: i.id,
        childId: i.childId,
        createdAt: i.createdAt,
      });
    }
    return list
      .filter((n) => !deletedNotifications.has(n.id))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  function toNotif(n) {
    return {
      id: n.id,
      text: [n.title, n.body].filter(Boolean).join(' — '),
      unread: !readNotifications.has(n.id),
      type: n.type,
      entityType: n.entityType,
      entityId: n.entityId,
      childId: n.childId,
      createdAt: n.createdAt,
    };
  }

  return {
    // Same method names and shapes as the REST client's chat section, so the
    // screens cannot tell the two apart.
    chat: createParentChatMock(db, runtime),

    children: {
      async list() {
        return myChildren().map(toChildResponse);
      },
      async get(childId) {
        const child = requireChild(childId);
        return {
          id: child.id,
          fullName: child.name,
          dob: String(child.dateOfBirth ?? '').slice(0, 10) || null,
          roomName: roomName(child.roomId),
          photoUrl: child.photoUrl ?? null,
          allergies: (child.allergies ?? []).join(', '),
          medicalNotes: child.medicalNotes ?? '',
          immunizations: (child.immunization ?? []).join(', '),
          pickups: (child.pickupContacts ?? []).map((p) => ({
            id: p.id,
            childId: child.id,
            fullName: p.name,
            relationship: p.relationship,
            phone: p.phone,
            createdAt: child.createdAt,
            updatedAt: child.createdAt,
          })),
          emergencyContacts: [],
        };
      },
    },

    async nursery() {
      const parent = currentParent();
      const nur = db.nurseries.find((n) => n.id === parent.nurseryId);
      if (!nur) throw new NotFoundError('Nursery not found');
      const center = nur.geofence?.center ?? {};
      return {
        id: nur.id,
        name: nur.name,
        logoUrl: nur.logoUrl ?? null,
        timezone: TZ,
        hoursStart: '08:00',
        hoursEnd: '16:00',
        geofenceLat: center.lat ?? null,
        geofenceLng: center.lng ?? null,
        geofenceRadiusM: nur.geofence?.radiusMeters ?? 100,
      };
    },

    attendance: {
      async get(childId, date) {
        const child = requireChild(childId);
        return toAttendanceResponse(child, childId, date);
      },
      async history(childId, _from, _to) {
        requireChild(childId);
        const { rec, status, date } = attendanceFor(childId, null);
        if (!rec) return [];
        return [
          {
            date,
            status,
            lastCheckInAt: rec.checkInAt ?? null,
            lastCheckOutAt: rec.checkOutAt ?? null,
          },
        ];
      },
      async checkIn(childId, _location) {
        const child = requireChild(childId);
        let rec = db.attendance.find((a) => a.childId === childId);
        if (!rec) {
          rec = {
            id: newId('att'),
            nurseryId: child.nurseryId,
            roomId: child.roomId,
            childId,
            checkInAt: new Date().toISOString(),
            checkOutAt: null,
            checkInBy: runtime.activeUserId,
            checkOutBy: null,
            method: 'geofence',
          };
          db.attendance.push(rec);
        } else {
          rec.checkInAt = new Date().toISOString();
          rec.checkOutAt = null;
        }
        return toAttendanceResponse(child, childId, null);
      },
      async checkOut(childId, _location) {
        const child = requireChild(childId);
        const rec = db.attendance.find((a) => a.childId === childId);
        if (rec) {
          rec.checkOutAt = new Date().toISOString();
          rec.checkOutBy = runtime.activeUserId;
        }
        return toAttendanceResponse(child, childId, null);
      },
    },

    dailyLogs: {
      // Grouped shape (matches the REST client's normalized output). Seed logs
      // are already grouped, so we just project the fields the screens use.
      async get(childId, date) {
        requireChild(childId);
        const log = db.dailyLogs.find(
          (l) => l.childId === childId && l.date === date && l.publishedAt,
        );
        if (!log) return null;
        return {
          logDate: log.date,
          mood: log.mood ?? null,
          meals: log.meals ?? [],
          naps: log.naps ?? [],
          diapers: log.diapers ?? [],
          activities: log.activities ?? [],
          medication: log.medication ?? [],
        };
      },
      async list(childId, from, to) {
        requireChild(childId);
        return db.dailyLogs
          .filter((l) => l.childId === childId && l.publishedAt && l.date >= from && l.date <= to)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((l) => ({
            id: l.id,
            childId,
            logDate: l.date,
            totalEntries: 0,
            publishedEntries: 0,
            updatedAt: l.updatedAt,
          }));
      },
    },

    announcements: {
      async list() {
        const parent = currentParent();
        return db.announcements
          .filter((a) => a.nurseryId === parent.nurseryId && a.publishedAt)
          .sort((x, y) => (x.publishedAt < y.publishedAt ? 1 : -1))
          .map((a) => toAnnouncement(a, parent.id));
      },
      async get(id) {
        const parent = currentParent();
        const a = db.announcements.find((x) => x.id === id);
        if (!a) throw new NotFoundError('Announcement not found');
        return toAnnouncement(a, parent.id);
      },
      async markSeen(id) {
        const parent = currentParent();
        const a = db.announcements.find((x) => x.id === id);
        if (!a) throw new NotFoundError('Announcement not found');
        seenAnnouncements.add(id);
        if (!(a.seenByUserIds ?? []).includes(parent.id)) {
          a.seenByUserIds = [...(a.seenByUserIds ?? []), parent.id];
        }
        return toAnnouncement(a, parent.id);
      },
    },

    events: {
      async list(upcoming = false) {
        const parent = currentParent();
        const now = Date.now();
        return db.events
          .filter((e) => e.nurseryId === parent.nurseryId)
          .filter((e) => (upcoming ? new Date(e.startsAt).getTime() >= now : true))
          .sort((x, y) => (x.startsAt < y.startsAt ? -1 : 1))
          .map(toEvent);
      },
      async listSaved() {
        const parent = currentParent();
        return db.events
          .filter((e) => e.nurseryId === parent.nurseryId && savedEvents.has(e.id))
          .map(toEvent);
      },
      async save(id) {
        savedEvents.add(id);
      },
      async unsave(id) {
        savedEvents.delete(id);
      },
    },

    incidents: {
      async listByChild(childId) {
        const child = requireChild(childId);
        return db.incidents
          .filter((i) => i.childId === childId)
          .sort((x, y) => (x.occurredAt < y.occurredAt ? 1 : -1))
          .map((i) => toIncident(i, child));
      },
      async get(incidentId) {
        const inc = db.incidents.find((i) => i.id === incidentId);
        if (!inc) throw new NotFoundError('Incident not found');
        const child = db.children.find((c) => c.id === inc.childId);
        return toIncident(inc, child);
      },
      async acknowledge(incidentId) {
        const inc = db.incidents.find((i) => i.id === incidentId);
        if (!inc) throw new NotFoundError('Incident not found');
        inc.parentAcknowledgedAt = new Date().toISOString();
        inc.parentAcknowledgedBy = runtime.activeUserId;
        const child = db.children.find((c) => c.id === inc.childId);
        return toIncident(inc, child);
      },
    },

    notifications: {
      async list(status = 'all') {
        let list = buildNotifications().map(toNotif);
        if (status === 'unread') list = list.filter((n) => n.unread);
        else if (status === 'read') list = list.filter((n) => !n.unread);
        return list;
      },
      async unreadCount() {
        const unread = buildNotifications().filter((n) => !readNotifications.has(n.id)).length;
        return { unread };
      },
      async markRead(id) {
        readNotifications.add(id);
        const n = buildNotifications().find((x) => x.id === id);
        return n ? toNotif(n) : null;
      },
      async markAllRead() {
        buildNotifications().forEach((n) => readNotifications.add(n.id));
        return { unread: 0 };
      },
      async remove(id) {
        deletedNotifications.add(id);
      },
      async removeAll() {
        buildNotifications().forEach((n) => deletedNotifications.add(n.id));
      },
    },

    notificationPreferences: {
      async get() {
        return { ...prefs };
      },
      async update(patch = {}) {
        if (patch.clearQuietHours) {
          prefs = { ...prefs, quietHoursStart: null, quietHoursEnd: null };
        } else {
          if (patch.quietHoursStart !== undefined) prefs.quietHoursStart = patch.quietHoursStart;
          if (patch.quietHoursEnd !== undefined) prefs.quietHoursEnd = patch.quietHoursEnd;
        }
        if (patch.announcementsEnabled !== undefined && patch.announcementsEnabled !== null) {
          prefs.announcementsEnabled = patch.announcementsEnabled;
        }
        return { ...prefs };
      },
    },

    schedule: {
      // The seed DB has no room-sessions table; synthesize a plausible day of
      // sessions for the child's room on today so the schedule is demoable.
      async get(childId, date) {
        const child = requireChild(childId);
        const today = new Date().toISOString().slice(0, 10);
        if (date !== today) return [];
        const teacher = db.users.find((u) => u.role === 'teacher');
        const p = (n) => String(n).padStart(2, '0');
        const mk = (n, name, sh, sm, eh, em) => ({
          id: `mocksession_${childId}_${n}`,
          roomId: child.roomId,
          name,
          date: today,
          startTime: `${p(sh)}:${p(sm)}:00`,
          endTime: `${p(eh)}:${p(em)}:00`,
          teacherId: teacher?.id ?? null,
          teacherName: teacher?.name ?? 'Ms. Teacher',
        });
        return [
          mk(1, 'Music Session', 9, 0, 10, 0),
          mk(2, 'Art Session', 10, 0, 11, 0),
          mk(3, 'Story Time', 11, 0, 11, 30),
          mk(4, 'Break', 11, 30, 12, 0),
        ];
      },
    },

    media: {
      // The seed DB has no media table; synthesize a few stable photos for the
      // child on today's date so the gallery is demoable in mock mode.
      async list(childId, params = {}) {
        const child = requireChild(childId);
        const today = new Date().toISOString().slice(0, 10);
        const wantDate = params.date ?? today;
        if (wantDate !== today) return [];
        return [1, 2, 3, 4].map((n) => ({
          id: `mockmedia_${childId}_${n}`,
          scope: 'CHILD',
          childId,
          childName: child.name,
          roomId: child.roomId,
          roomName: roomName(child.roomId),
          type: 'PHOTO',
          contentType: 'image/jpeg',
          sizeBytes: 0,
          caption: null,
          fileUrl: `https://picsum.photos/seed/${childId}-${n}/600/600`,
          uploaderId: null,
          uploaderName: 'Teacher',
          uploadedAt: new Date().toISOString(),
        }));
      },
    },
  };
}
