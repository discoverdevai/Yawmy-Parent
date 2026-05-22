import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createAttendanceMock(db, runtime) {
  return {
    async list(scope, params = {}) {
      assertTenantScope(scope);
      let items = db.attendance.filter((a) => a.nurseryId === scope.nurseryId);
      if (params.roomId) items = items.filter((a) => a.roomId === params.roomId);
      if (params.on) {
        items = items.filter((a) => a.checkInAt.startsWith(params.on));
      }
      return items;
    },
    async checkIn(scope, input) {
      assertTenantScope(scope);
      const child = db.children.find((c) => c.id === input.childId);
      if (!child) throw new NotFoundError('Child not found');
      assertResourceInScope(scope, child);
      const record = {
        id: newId('att'),
        nurseryId: scope.nurseryId,
        roomId: child.roomId,
        childId: child.id,
        checkInAt: new Date().toISOString(),
        checkOutAt: null,
        checkInBy: runtime.activeUserId ?? db.demoAdminId,
        checkOutBy: null,
        method: input.method,
      };
      db.attendance.push(record);
      return record;
    },
    async checkOut(scope, attendanceId) {
      assertTenantScope(scope);
      const r = db.attendance.find((a) => a.id === attendanceId);
      if (!r) throw new NotFoundError('Attendance record not found');
      assertResourceInScope(scope, r);
      r.checkOutAt = new Date().toISOString();
      r.checkOutBy = runtime.activeUserId ?? db.demoAdminId;
      return r;
    },
  };
}
