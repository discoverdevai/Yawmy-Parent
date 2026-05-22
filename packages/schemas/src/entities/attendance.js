import { z } from 'zod';
import { AttendanceId, NurseryId, RoomId, ChildId, UserId, Iso } from './common';

export const AttendanceMethod = z.enum(['geofence', 'manual']);

export const AttendanceRecord = z.object({
  id: AttendanceId,
  nurseryId: NurseryId,
  roomId: RoomId,
  childId: ChildId,
  checkInAt: Iso,
  checkOutAt: Iso.nullable(),
  checkInBy: UserId,
  checkOutBy: UserId.nullable(),
  method: AttendanceMethod,
});
