import { z } from 'zod';
import { ThreadId, MessageId, NurseryId, RoomId, UserId, Iso } from './common';

export const ThreadKind = z.enum(['oneOnOne', 'roomGroup', 'staffGroup']);

export const Thread = z.object({
  id: ThreadId,
  nurseryId: NurseryId,
  kind: ThreadKind,
  participantIds: z.array(UserId),
  roomId: RoomId.nullable(),
  title: z.string().nullable(),
  createdAt: Iso,
  lastMessageAt: Iso.nullable(),
});

export const MessageAttachment = z.object({
  kind: z.enum(['image', 'video']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
});

export const Message = z.object({
  id: MessageId,
  threadId: ThreadId,
  authorId: UserId,
  body: z.string(),
  attachments: z.array(MessageAttachment).default([]),
  reactions: z.array(z.object({ userId: UserId, emoji: z.string() })).default([]),
  replyToId: MessageId.nullable(),
  removedByModerator: z.boolean().default(false),
  sentAt: Iso,
  readBy: z.array(UserId).default([]),
});
