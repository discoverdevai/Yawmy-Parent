import { faker } from '@faker-js/faker';

let counter = 1;
function id(prefix) {
  return `${prefix}_${(counter++).toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function isoMinusDays(days) {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

function isoPlusDays(days) {
  return new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
}

const NURSERY_HOURS = {
  schedule: {
    sun: { open: '08:00', close: '16:00' },
    mon: { open: '08:00', close: '16:00' },
    tue: { open: '08:00', close: '16:00' },
    wed: { open: '08:00', close: '16:00' },
    thu: { open: '08:00', close: '16:00' },
    fri: null,
    sat: null,
  },
};

export function createMockDb({ seed = 1 } = {}) {
  faker.seed(seed);
  counter = 1;

  // Two nurseries to validate tenant isolation; admin signs into the first.
  const nurseries = [
    {
      id: id('nur'),
      name: 'Sunflower Nursery',
      logoUrl: null,
      geofence: {
        center: { lat: 30.0444, lng: 31.2357 }, // Cairo
        radiusMeters: 100,
      },
      hours: NURSERY_HOURS,
      createdAt: isoMinusDays(60),
    },
    {
      id: id('nur'),
      name: 'Olive Tree Nursery',
      logoUrl: null,
      geofence: {
        center: { lat: 31.2001, lng: 29.9187 }, // Alexandria
        radiusMeters: 100,
      },
      hours: NURSERY_HOURS,
      createdAt: isoMinusDays(45),
    },
  ];

  const users = [];
  const rooms = [];
  const children = [];
  const incidents = [];
  const announcements = [];
  const events = [];
  const threads = [];
  const messages = [];
  const attendance = [];
  const invites = [];
  const dailyLogs = [];

  // Demo admin signs into nursery #1 with these credentials
  const primaryNurseryId = nurseries[0].id;
  const demoAdmin = {
    id: id('usr'),
    nurseryId: primaryNurseryId,
    role: 'admin',
    email: 'admin@nms.local',
    name: 'Nour Admin',
    phone: '+201001234567',
    locale: 'en',
    active: true,
    createdAt: isoMinusDays(60),
  };
  users.push(demoAdmin);

  // Two teachers + two demo parents in primary nursery. parent@nms.local is
  // the "fresh" parent (no check-in yet, no published logs) — they see the
  // empty home variants. parent2@nms.local has already checked in today
  // and has logs/media/announcements/events seeded so we can demo the
  // populated "Home-after check in" Figma frame.
  const teacher1 = makeUser('usr', primaryNurseryId, 'teacher', 'Sara Teacher', 'sara@nms.local');
  const teacher2 = makeUser('usr', primaryNurseryId, 'teacher', 'Fatima Teacher', 'fatima@nms.local');
  const demoParent = makeUser('usr', primaryNurseryId, 'parent', 'Rania Parent', 'parent@nms.local');
  const demoParent2 = makeUser(
    'usr',
    primaryNurseryId,
    'parent',
    'Layla Parent',
    'parent2@nms.local',
  );
  users.push(teacher1, teacher2, demoParent, demoParent2);

  // Three rooms in primary nursery
  const roomA = makeRoom('rm', primaryNurseryId, 'Sunshine Room', 18, 30, 12, [teacher1.id]);
  const roomB = makeRoom('rm', primaryNurseryId, 'Rainbow Room', 30, 48, 14, [teacher2.id]);
  const roomC = makeRoom('rm', primaryNurseryId, 'Garden Room', 12, 24, 10, [teacher1.id, teacher2.id]);
  rooms.push(roomA, roomB, roomC);

  // Children spread across rooms
  const totalChildren = 18;
  const parents = [];
  for (let i = 0; i < totalChildren; i++) {
    const room = [roomA, roomB, roomC][i % 3];
    const child = makeChild('chd', primaryNurseryId, room.id);
    children.push(child);
    room.childIds.push(child.id);

    if (i === 0) {
      // Wire the demo parent to the very first child so signing in as
      // parent@nms.local has data in the home tab.
      child.guardianIds.push(demoParent.id);
      parents.push(demoParent);
    } else if (i === 1) {
      // parent2@nms.local — wired to the second seeded child, who already
      // has a check-in record + published log + media for today.
      child.guardianIds.push(demoParent2.id);
      parents.push(demoParent2);
    } else if (i % 4 === 0) {
      const parent = makeUser('usr', primaryNurseryId, 'parent', faker.person.fullName(), faker.internet.email().toLowerCase());
      users.push(parent);
      parents.push(parent);
      child.guardianIds.push(parent.id);
    }
  }

  // Seed an open incident
  incidents.push({
    id: id('inc'),
    nurseryId: primaryNurseryId,
    roomId: roomA.id,
    childId: roomA.childIds[0],
    reportedBy: teacher1.id,
    occurredAt: isoMinusDays(1),
    description: 'Minor scrape on the playground',
    actionTaken: 'Cleaned and bandaged',
    bodyArea: 'leg',
    parentAcknowledgedAt: null,
    parentAcknowledgedBy: null,
    attachments: [],
    createdAt: isoMinusDays(1),
  });

  // Two announcements
  announcements.push({
    id: id('ann'),
    nurseryId: primaryNurseryId,
    authorId: demoAdmin.id,
    scope: { kind: 'nursery' },
    title: 'Welcome back this term',
    content: { body: 'New term schedule attached.', imageUrls: [], pdfUrls: [], links: [] },
    publishedAt: isoMinusDays(7),
    seenByUserIds: parents.slice(0, 2).map((p) => p.id),
  });
  announcements.push({
    id: id('ann'),
    nurseryId: primaryNurseryId,
    authorId: demoAdmin.id,
    scope: { kind: 'rooms', roomIds: [roomA.id] },
    title: 'Sunshine Room field trip',
    content: { body: 'Field trip to the botanical garden next Thursday.', imageUrls: [], pdfUrls: [], links: [] },
    publishedAt: isoMinusDays(2),
    seenByUserIds: [],
  });

  // Two events
  events.push({
    id: id('evt'),
    nurseryId: primaryNurseryId,
    kind: 'oneTime',
    title: 'Parent–teacher meeting',
    description: '15-minute slots for each family',
    startsAt: isoPlusDays(7),
    endsAt: isoPlusDays(7),
    recurrenceRule: null,
    scopeRoomIds: null,
    createdAt: isoMinusDays(3),
  });
  events.push({
    id: id('evt'),
    nurseryId: primaryNurseryId,
    kind: 'holiday',
    title: 'National holiday',
    description: 'Nursery closed',
    startsAt: isoPlusDays(14),
    endsAt: isoPlusDays(14),
    recurrenceRule: null,
    scopeRoomIds: null,
    createdAt: isoMinusDays(10),
  });

  // Seed today's published daily log for parent2's child so the Daily Logs
  // tab has populated content out-of-the-box. Other children stay logless
  // so the empty state is exercisable too.
  const parent2Child = children[1];
  if (parent2Child) {
    const today = new Date().toISOString().slice(0, 10);
    dailyLogs.push({
      id: id('dlg'),
      nurseryId: primaryNurseryId,
      roomId: parent2Child.roomId,
      childId: parent2Child.id,
      date: today,
      mood: 'happy',
      meals: [
        { id: id('mel'), time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), description: 'Breakfast: Ate most of breakfast', amount: 'most' },
        { id: id('mel'), time: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), description: 'Lunch: Ate full lunch', amount: 'all' },
        { id: id('mel'), time: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(), description: 'Snack: Had a small snack', amount: 'some' },
      ],
      naps: [
        {
          id: id('nap'),
          startAt: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
          endAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
          quality: 'restful',
        },
        {
          id: id('nap'),
          startAt: new Date(new Date().setHours(10, 45, 0, 0)).toISOString(),
          endAt: new Date(new Date().setHours(11, 15, 0, 0)).toISOString(),
          quality: 'restless',
        },
      ],
      diapers: [
        { id: id('dpr'), time: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(), kind: 'wet' },
        { id: id('dpr'), time: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(), kind: 'soiled' },
        { id: id('dpr'), time: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(), kind: 'wet' },
      ],
      activities: [
        { id: id('act'), description: 'Participated in drawing' },
        { id: id('act'), description: 'Played in playground' },
        { id: id('act'), description: 'Enjoyed story reading' },
      ],
      medication: [
        { id: id('med'), time: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), drug: 'Vitamin D', dose: '1 drop', notes: '' },
        { id: id('med'), time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), drug: 'Vitamin C', dose: '1 chewable', notes: '' },
      ],
      publishedAt: new Date().toISOString(),
      publishedBy: teacher1.id,
      seenAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  // Today's attendance — 60% of children present
  for (const child of children) {
    if (Math.random() > 0.4) {
      attendance.push({
        id: id('att'),
        nurseryId: primaryNurseryId,
        roomId: child.roomId,
        childId: child.id,
        checkInAt: new Date(new Date().setHours(8, 30 + Math.floor(Math.random() * 60), 0, 0)).toISOString(),
        checkOutAt: null,
        checkInBy: child.guardianIds[0] ?? demoAdmin.id,
        checkOutBy: null,
        method: 'geofence',
      });
    }
  }

  // A live invite token so the invite/[token] flow can be exercised end-to-end
  invites.push({
    token: 'DEMOINVITE',
    nurseryId: primaryNurseryId,
    invitedRole: 'teacher',
    invitedEmail: 'newteacher@nms.local',
    invitedName: 'New Teacher',
    expiresAt: new Date(Date.now() + 47 * 3600 * 1000).toISOString(),
    consumedAt: null,
  });
  // Parent-flavored invite for the parent app's invite welcome flow
  invites.push({
    token: 'PARENTINVITE',
    nurseryId: primaryNurseryId,
    invitedRole: 'parent',
    invitedEmail: 'newparent@nms.local',
    invitedName: 'New Parent',
    expiresAt: new Date(Date.now() + 47 * 3600 * 1000).toISOString(),
    consumedAt: null,
  });
  // An expired invite to verify the error state
  invites.push({
    token: 'EXPIREDINVITE',
    nurseryId: primaryNurseryId,
    invitedRole: 'parent',
    invitedEmail: 'former@nms.local',
    invitedName: 'Former Parent',
    expiresAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    consumedAt: null,
  });

  // Staff group thread
  threads.push({
    id: id('thr'),
    nurseryId: primaryNurseryId,
    kind: 'staffGroup',
    participantIds: [demoAdmin.id, teacher1.id, teacher2.id],
    roomId: null,
    title: null,
    createdAt: isoMinusDays(60),
    lastMessageAt: isoMinusDays(0),
  });

  return {
    nurseries,
    users,
    rooms,
    children,
    incidents,
    announcements,
    events,
    threads,
    messages,
    attendance,
    invites,
    dailyLogs,
    primaryNurseryId,
    demoAdminId: demoAdmin.id,
    demoParentId: demoParent.id,
    demoParent2Id: demoParent2.id,
    DEMO_ADMIN_EMAIL: demoAdmin.email,
    DEMO_ADMIN_PASSWORD: 'admin1234',
    DEMO_PARENT_EMAIL: demoParent.email,
    DEMO_PARENT_PASSWORD: 'password123',
    DEMO_PARENT2_EMAIL: demoParent2.email,
    DEMO_PARENT2_PASSWORD: 'password123',
  };
}

function makeUser(prefix, nurseryId, role, name, email) {
  return {
    id: id(prefix),
    nurseryId,
    role,
    email,
    name,
    phone: null,
    locale: 'en',
    active: true,
    createdAt: nowIso(),
  };
}

function makeRoom(prefix, nurseryId, name, minMonths, maxMonths, capacity, teacherIds) {
  return {
    id: id(prefix),
    nurseryId,
    name,
    ageRange: { minMonths, maxMonths },
    capacity,
    teacherIds,
    childIds: [],
    archived: false,
    createdAt: nowIso(),
  };
}

function makeChild(prefix, nurseryId, roomId) {
  return {
    id: id(prefix),
    nurseryId,
    roomId,
    name: faker.person.firstName(),
    photoUrl: null,
    dateOfBirth: faker.date
      .between({ from: '2020-01-01', to: '2024-01-01' })
      .toISOString(),
    allergies: faker.helpers.arrayElements(['Peanuts', 'Dairy', 'Eggs'], { min: 0, max: 2 }),
    medicalNotes: '',
    immunization: [],
    pickupContacts: [
      {
        id: id('pkc'),
        name: faker.person.fullName(),
        phone: '+2010' + faker.number.int({ min: 10000000, max: 99999999 }),
        relationship: faker.helpers.arrayElement(['Mother', 'Father', 'Grandmother', 'Aunt']),
      },
    ],
    guardianIds: [],
    enrolled: true,
    createdAt: nowIso(),
  };
}

export function newId(prefix) {
  return id(prefix);
}
