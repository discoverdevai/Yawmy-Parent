import { newId } from './db';
import { assertTenantScope } from '../clients/tenant-scope';

const jobs = new Map();

function csvEscape(value) {
  if (value == null) return '';
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(rows) {
  if (rows.length === 0) return '';
  const header = Object.keys(rows[0]);
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((k) => csvEscape(row[k])).join(','));
  }
  return lines.join('\n');
}

export function createExportMock(db) {
  return {
    async request(scope, input) {
      assertTenantScope(scope);
      const jobId = newId('xprt');
      let rows;
      if (input.kind === 'children') {
        rows = db.children
          .filter((c) => c.nurseryId === scope.nurseryId)
          .map((c) => ({
            id: c.id,
            name: c.name,
            dateOfBirth: c.dateOfBirth,
            roomId: c.roomId ?? '',
            allergies: c.allergies.join('; '),
            enrolled: c.enrolled,
          }));
      } else if (input.kind === 'attendance') {
        rows = db.attendance
          .filter(
            (a) =>
              a.nurseryId === scope.nurseryId &&
              a.checkInAt >= input.rangeStart &&
              a.checkInAt <= input.rangeEnd,
          )
          .map((a) => ({
            id: a.id,
            childId: a.childId,
            roomId: a.roomId,
            checkInAt: a.checkInAt,
            checkOutAt: a.checkOutAt ?? '',
            method: a.method,
          }));
      } else {
        rows = db.incidents
          .filter(
            (i) =>
              i.nurseryId === scope.nurseryId &&
              i.occurredAt >= input.rangeStart &&
              i.occurredAt <= input.rangeEnd,
          )
          .map((i) => ({
            id: i.id,
            childId: i.childId,
            roomId: i.roomId,
            occurredAt: i.occurredAt,
            description: i.description,
            actionTaken: i.actionTaken,
            bodyArea: i.bodyArea,
            acknowledged: i.parentAcknowledgedAt ? 'yes' : 'no',
          }));
      }
      jobs.set(jobId, { status: 'ready', csv: rowsToCsv(rows) });
      return { jobId };
    },
    async status(_scope, jobId) {
      return jobs.get(jobId) ?? { status: 'pending' };
    },
  };
}
