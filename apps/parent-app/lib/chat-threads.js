// Shared chat threads used by the chat list and conversation screens. Real
// threads arrive via @nms/data; this mirrors the Figma sample content.
export const teacherAvatar = require('../assets/home/photos/avatar.png');

export const THREADS = [
  {
    id: 'teacher',
    name: 'Teacher Chat',
    kind: 'person',
    avatar: teacherAvatar,
    preview: 'Perfect! See you tomorrow ...',
    time: '10:30 AM',
    unread: 9,
  },
  {
    id: 'admin',
    name: 'Admin Chat',
    kind: 'initial',
    initial: 'A',
    preview: 'Perfect! See you tomorrow ...',
    time: '10:30 AM',
    unread: 9,
  },
  {
    id: 'room',
    name: 'Room group',
    kind: 'group',
    preview: 'Perfect! See you tomorrow ...',
    time: '10:30 AM',
    unread: 0,
  },
];

export const THREAD_BY_ID = Object.fromEntries(THREADS.map((t) => [t.id, t]));
