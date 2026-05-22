import { createMockDb } from './db';
import { createAuthMock } from './auth.mock';
import { createNurseryMock } from './nursery.mock';
import { createRoomsMock } from './rooms.mock';
import { createChildrenMock } from './children.mock';
import { createEnrollmentMock } from './enrollment.mock';
import { createAttendanceMock } from './attendance.mock';
import { createIncidentsMock } from './incidents.mock';
import { createAnnouncementsMock } from './announcements.mock';
import { createEventsMock } from './events.mock';
import { createChatMock } from './chat.mock';
import { createExportMock } from './export.mock';
import { createDailyLogsMock } from './daily-logs.mock';

/**
 * @param {{ seed?: number, latencyMs?: number }} [options]
 * @returns {{ clients: import('../clients').ApiClients, db: ReturnType<typeof createMockDb> }}
 */
export function createMockClients(options = {}) {
  const db = createMockDb({ seed: options.seed ?? 1 });
  const runtime = { activeUserId: null };

  const latency = (fn) => async (...args) => {
    if (options.latencyMs && options.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, options.latencyMs));
    }
    return fn(...args);
  };

  function withLatency(client) {
    const wrapped = {};
    for (const key of Object.keys(client)) {
      wrapped[key] = typeof client[key] === 'function' ? latency(client[key].bind(client)) : client[key];
    }
    return wrapped;
  }

  const clients = {
    auth: withLatency(createAuthMock(db, runtime)),
    nursery: withLatency(createNurseryMock(db)),
    rooms: withLatency(createRoomsMock(db)),
    children: withLatency(createChildrenMock(db)),
    enrollment: withLatency(createEnrollmentMock(db)),
    attendance: withLatency(createAttendanceMock(db, runtime)),
    incidents: withLatency(createIncidentsMock(db)),
    announcements: withLatency(createAnnouncementsMock(db, runtime)),
    events: withLatency(createEventsMock(db)),
    chat: withLatency(createChatMock(db, runtime)),
    export: withLatency(createExportMock(db)),
    dailyLogs: withLatency(createDailyLogsMock(db)),
  };

  return { clients, db };
}
