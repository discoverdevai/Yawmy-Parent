import { z } from 'zod';
import { ChildId, NurseryId, RoomId, UserId, Phone, Iso } from './common';

export const PickupContact = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: Phone,
  relationship: z.string().min(1),
});

export const ImmunizationRecord = z.object({
  vaccine: z.string().min(1),
  date: Iso,
  notes: z.string().optional(),
});

export const Child = z.object({
  id: ChildId,
  nurseryId: NurseryId,
  roomId: RoomId.nullable(),
  name: z.string().min(1),
  photoUrl: z.string().url().nullable(),
  dateOfBirth: Iso,
  allergies: z.array(z.string()).default([]),
  medicalNotes: z.string().default(''),
  immunization: z.array(ImmunizationRecord).default([]),
  pickupContacts: z.array(PickupContact).default([]),
  guardianIds: z.array(UserId).default([]),
  enrolled: z.boolean().default(true),
  createdAt: Iso,
});
