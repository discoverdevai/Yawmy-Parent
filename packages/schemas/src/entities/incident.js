import { z } from 'zod';
import { IncidentId, NurseryId, RoomId, ChildId, UserId, Iso } from './common';

export const BodyArea = z.enum([
  'head',
  'face',
  'arm',
  'hand',
  'torso',
  'leg',
  'foot',
  'other',
  'none',
]);

export const Incident = z.object({
  id: IncidentId,
  nurseryId: NurseryId,
  roomId: RoomId,
  childId: ChildId,
  reportedBy: UserId,
  occurredAt: Iso,
  description: z.string().min(1),
  actionTaken: z.string().min(1),
  bodyArea: BodyArea.default('none'),
  parentAcknowledgedAt: Iso.nullable(),
  parentAcknowledgedBy: UserId.nullable(),
  attachments: z.array(z.string().url()).default([]),
  createdAt: Iso,
});
