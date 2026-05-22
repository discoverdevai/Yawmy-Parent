import { z } from 'zod';
import { AnnouncementId, NurseryId, RoomId, UserId, Iso } from './common';

export const AnnouncementScope = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('nursery') }),
  z.object({ kind: z.literal('rooms'), roomIds: z.array(RoomId).min(1) }),
]);

export const AnnouncementContent = z.object({
  body: z.string().min(1),
  imageUrls: z.array(z.string().url()).default([]),
  pdfUrls: z.array(z.string().url()).default([]),
  links: z.array(z.string().url()).default([]),
});

export const Announcement = z.object({
  id: AnnouncementId,
  nurseryId: NurseryId,
  authorId: UserId,
  scope: AnnouncementScope,
  title: z.string().min(1),
  content: AnnouncementContent,
  publishedAt: Iso,
  seenByUserIds: z.array(UserId).default([]),
});
