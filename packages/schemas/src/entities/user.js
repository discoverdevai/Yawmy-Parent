import { z } from 'zod';
import { UserId, NurseryId, Email, Phone, Role, Locale, Iso } from './common';

export const User = z.object({
  id: UserId,
  nurseryId: NurseryId,
  role: Role,
  email: Email,
  name: z.string().min(1),
  phone: Phone.optional(),
  locale: Locale.default('en'),
  active: z.boolean().default(true),
  createdAt: Iso,
});

export const Invite = z.object({
  token: z.string().min(1),
  nurseryId: NurseryId,
  invitedRole: Role,
  invitedEmail: Email,
  invitedName: z.string().min(1),
  expiresAt: Iso,
  consumedAt: Iso.nullable(),
});

export const Session = z.object({
  user: User,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: Iso,
});
