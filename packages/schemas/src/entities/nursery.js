import { z } from 'zod';
import { NurseryId, Coordinates, Iso } from './common';

export const Geofence = z.object({
  center: Coordinates,
  radiusMeters: z.number().int().min(20).max(2000),
});

export const NurseryHours = z.object({
  // 24-hour HH:mm strings; nursery is closed on days not present
  schedule: z.record(
    z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
    z
      .object({
        open: z.string().regex(/^\d{2}:\d{2}$/),
        close: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .nullable(),
  ),
});

export const Nursery = z.object({
  id: NurseryId,
  name: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  geofence: Geofence,
  hours: NurseryHours,
  createdAt: Iso,
});
