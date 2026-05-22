import { z } from 'zod';
import { RoomId, NurseryId, UserId, ChildId, Iso } from './common';

export const Room = z.object({
  id: RoomId,
  nurseryId: NurseryId,
  name: z.string().min(1),
  ageRange: z
    .object({
      minMonths: z.number().int().min(0),
      maxMonths: z.number().int().min(0),
    })
    .nullable(),
  capacity: z.number().int().min(0).nullable(),
  teacherIds: z.array(UserId).default([]),
  childIds: z.array(ChildId).default([]),
  archived: z.boolean().default(false),
  createdAt: Iso,
});
