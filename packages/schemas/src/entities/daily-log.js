import { z } from 'zod';
import { Id, NurseryId, RoomId, ChildId, UserId, Iso } from './common';

export const Mood = z.enum(['happy', 'calm', 'fussy', 'sad', 'sleepy', 'energetic']);

export const Meal = z.object({
  id: Id,
  time: Iso,
  description: z.string().min(1),
  amount: z.enum(['none', 'some', 'most', 'all']).default('most'),
});

export const Nap = z.object({
  id: Id,
  startAt: Iso,
  endAt: Iso,
  quality: z.enum(['restful', 'restless', 'short']).default('restful'),
});

export const DiaperEntry = z.object({
  id: Id,
  time: Iso,
  kind: z.enum(['wet', 'soiled', 'both', 'dry']),
});

export const Activity = z.object({
  id: Id,
  description: z.string().min(1),
});

export const MedicationDose = z.object({
  id: Id,
  time: Iso,
  drug: z.string().min(1),
  dose: z.string().min(1),
  notes: z.string().default(''),
});

export const DailyLog = z.object({
  id: Id,
  nurseryId: NurseryId,
  roomId: RoomId,
  childId: ChildId,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: Mood.nullable(),
  meals: z.array(Meal).default([]),
  naps: z.array(Nap).default([]),
  diapers: z.array(DiaperEntry).default([]),
  activities: z.array(Activity).default([]),
  medication: z.array(MedicationDose).default([]),
  publishedAt: Iso.nullable(),
  publishedBy: UserId.nullable(),
  seenAt: Iso.nullable(),
  updatedAt: Iso,
});
