import { z } from 'zod';

export const Id = z.string().min(1);
export const NurseryId = Id;
export const UserId = Id;
export const RoomId = Id;
export const ChildId = Id;
export const IncidentId = Id;
export const EventId = Id;
export const AnnouncementId = Id;
export const ThreadId = Id;
export const MessageId = Id;
export const MediaId = Id;
export const AttendanceId = Id;

export const Iso = z.string().datetime({ offset: true });
export const Locale = z.enum(['en', 'ar']);
export const Role = z.enum(['admin', 'teacher', 'parent']);

export const Phone = z.string().min(6).max(20);
export const Email = z.string().email();

export const Coordinates = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
