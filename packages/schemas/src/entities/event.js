import { z } from 'zod';
import { EventId, NurseryId, RoomId, Iso } from './common';

export const EventKind = z.enum(['oneTime', 'recurring', 'holiday', 'parentTeacher']);

export const Event = z.object({
  id: EventId,
  nurseryId: NurseryId,
  kind: EventKind,
  title: z.string().min(1),
  description: z.string().default(''),
  startsAt: Iso,
  endsAt: Iso.nullable(),
  recurrenceRule: z.string().nullable(), // RRULE string for kind='recurring'
  scopeRoomIds: z.array(RoomId).nullable(), // null = whole nursery
  createdAt: Iso,
});
