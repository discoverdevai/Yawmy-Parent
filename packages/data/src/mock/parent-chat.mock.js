// Parent chat, mocked. Mirrors the shape of `createRestParentClient().chat`
// exactly — same method names, same returned objects — so the screens cannot
// tell the two apart and demo mode keeps working with no API base URL set.
//
// Deliberately in-memory: this exists so the app can be browsed, not so the
// mock can be a second implementation of the chat rules.

import { newId } from './db';

const NURSERY_THREAD = 'thread-nursery';
const ROOM_THREAD = 'thread-room';
const TEACHER_THREAD = 'thread-teacher';

function minutesAgo(n) {
  return new Date(Date.now() - n * 60000).toISOString();
}

function clockOf(date) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

export function createParentChatMock(_db, runtime) {
  const me = () => runtime.activeUserId ?? 'parent-me';
  const TEACHER_ID = 'teacher-1';

  const seed = () => [
    {
      id: newId('msg'),
      senderId: TEACHER_ID,
      senderName: 'Ms. Farida',
      body: 'Good morning! Amina settled in beautifully today.',
      attachments: [],
      reactions: {},
      replyToMessageId: null,
      replyToPreview: null,
      outOfHours: false,
      createdAt: minutesAgo(180),
      deletedAt: null,
    },
    {
      id: newId('msg'),
      senderId: me(),
      senderName: 'You',
      body: 'That is lovely to hear, thank you!',
      attachments: [],
      reactions: { '❤️': [TEACHER_ID] },
      replyToMessageId: null,
      replyToPreview: null,
      outOfHours: false,
      createdAt: minutesAgo(174),
      deletedAt: null,
    },
  ];

  // Per-thread message stores, seeded on first read.
  const threads = {};
  const threadOf = (id) => (threads[id] ||= id === TEACHER_THREAD ? seed() : []);
  const hidden = new Set();
  const muted = new Set();

  function normalize(dto) {
    const createdAt = new Date(dto.createdAt);
    return {
      id: dto.id,
      mine: dto.senderId === me(),
      senderId: dto.senderId,
      senderName: dto.senderName,
      type: 'text',
      text: dto.body ?? '',
      attachments: [],
      uri: null,
      duration: null,
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

  const previewOf = (id) => {
    const list = threadOf(id);
    const last = list[list.length - 1];
    return last ? { preview: last.body ?? '', at: last.createdAt } : { preview: '', at: null };
  };

  return {
    async directory(childId) {
      const nursery = previewOf(NURSERY_THREAD);
      const teacher = previewOf(TEACHER_THREAD);
      const room = previewOf(ROOM_THREAD);
      const rows = [
        {
          kind: 'ADMIN_SUPPORT',
          peerUserId: null,
          peerRole: 'ADMIN',
          roomId: null,
          title: 'Nursery Admin',
          subtitle: 'Nursery office',
          avatarUrl: null,
          threadId: NURSERY_THREAD,
          preview: nursery.preview,
          lastMessageAt: nursery.at,
          unread: 0,
          muted: false,
          isGroup: false,
        },
      ];
      // Without a child selected there is no room and no teachers — the same
      // state a newly enrolled family starts in.
      if (childId) {
        rows.push(
          {
            kind: 'ROOM_GROUP',
            peerUserId: null,
            peerRole: null,
            roomId: 'room-1',
            title: 'Sunflower Group Chat',
            subtitle: 'Teachers, parents and admins',
            avatarUrl: null,
            threadId: ROOM_THREAD,
            preview: room.preview,
            lastMessageAt: room.at,
            unread: 0,
            muted: false,
            isGroup: true,
          },
          {
            kind: 'DIRECT',
            peerUserId: TEACHER_ID,
            peerRole: 'TEACHER',
            roomId: null,
            title: 'Ms. Farida',
            subtitle: 'Lead Teacher',
            avatarUrl: null,
            threadId: TEACHER_THREAD,
            preview: teacher.preview,
            lastMessageAt: teacher.at,
            unread: 1,
            muted: false,
            isGroup: false,
          },
        );
      }
      return rows;
    },

    normalizeMessage: (dto) => normalize(dto),

    async ensureThread(entry) {
      return entry.threadId ?? NURSERY_THREAD;
    },

    async thread(threadId) {
      return { id: threadId, type: 'DIRECT', participants: [], muted: false };
    },

    async messages(threadId, { after } = {}) {
      const all = threadOf(threadId).filter((m) => !hidden.has(m.id));
      if (!after) return all;
      return all.filter((m) => new Date(m.createdAt) > new Date(after));
    },

    async send(threadId, { body, replyToMessageId } = {}) {
      const parent = threadOf(threadId).find((m) => m.id === replyToMessageId);
      const msg = {
        id: newId('msg'),
        senderId: me(),
        senderName: 'You',
        body: body ?? '',
        attachments: [],
        reactions: {},
        replyToMessageId: replyToMessageId ?? null,
        replyToPreview: parent?.body ?? null,
        outOfHours: false,
        createdAt: new Date().toISOString(),
        deletedAt: null,
      };
      threadOf(threadId).push(msg);
      return msg;
    },

    async markRead() {},
    async setThreadMuted() {},

    async addReaction(messageId, emoji) {
      for (const list of Object.values(threads)) {
        const m = list.find((x) => x.id === messageId);
        if (!m) continue;
        m.reactions = { ...m.reactions, [emoji]: [...(m.reactions[emoji] ?? []), me()] };
        return m;
      }
      return null;
    },

    async removeReaction(messageId, emoji) {
      for (const list of Object.values(threads)) {
        const m = list.find((x) => x.id === messageId);
        if (!m) continue;
        const rest = (m.reactions[emoji] ?? []).filter((u) => u !== me());
        m.reactions = { ...m.reactions };
        if (rest.length) m.reactions[emoji] = rest;
        else delete m.reactions[emoji];
        return m;
      }
      return null;
    },

    async deleteForEveryone(messageId) {
      for (const id of Object.keys(threads)) {
        threads[id] = threads[id].filter((m) => m.id !== messageId);
      }
    },

    async hideForMe(messageId) {
      hidden.add(messageId);
    },
    async unhideForMe(messageId) {
      hidden.delete(messageId);
    },

    async muteUser(userId) {
      muted.add(userId);
    },
    async unmuteUser(userId) {
      muted.delete(userId);
    },
    async mutedUserIds() {
      return [...muted];
    },

    async uploadMedia() {
      // Nothing is stored in mock mode, so report the failure the screen already
      // knows how to show rather than pretending an upload succeeded.
      return { uploaded: [], failed: [{ filename: '', reason: 'uploads need a real backend' }] };
    },
  };
}
