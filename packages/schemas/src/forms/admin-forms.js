import { z } from 'zod';
import { Email, Phone, Role, RoomId, ChildId, UserId } from '../entities/common';
import { Geofence, NurseryHours } from '../entities/nursery';
import { PickupContact, ImmunizationRecord } from '../entities/child';
import { EventKind } from '../entities/event';
import { AnnouncementContent, AnnouncementScope } from '../entities/announcement';

export const SignInForm = z.object({
  email: Email,
  password: z.string().min(8),
});

export const ForgotPasswordForm = z.object({
  email: Email,
});

export const OtpForm = z.object({
  code: z.string().length(4).regex(/^\d{4}$/),
});

export const SetPasswordForm = z
  .object({
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Za-z]/)
      .regex(/\d/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation:passwordsDontMatch',
  });

export const NurseryProfileForm = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  hours: NurseryHours,
});

export const GeofenceForm = Geofence;

export const RoomForm = z.object({
  name: z.string().min(1),
  ageRange: z
    .object({
      minMonths: z.number().int().min(0),
      maxMonths: z.number().int().min(0),
    })
    .nullable(),
  capacity: z.number().int().min(0).nullable(),
  teacherIds: z.array(UserId).default([]),
});

export const InviteStaffForm = z.object({
  email: Email,
  name: z.string().min(1),
  role: z.enum(['admin', 'teacher']),
  phone: Phone.optional(),
});

export const InviteParentForm = z.object({
  email: Email,
  name: z.string().min(1),
  phone: Phone.optional(),
  childIds: z.array(ChildId).min(1),
});

export const ChildForm = z.object({
  name: z.string().min(1),
  photoUrl: z.string().url().nullable(),
  dateOfBirth: z.string().min(1),
  roomId: RoomId.nullable(),
  allergies: z.array(z.string()).default([]),
  medicalNotes: z.string().default(''),
  immunization: z.array(ImmunizationRecord).default([]),
  pickupContacts: z.array(PickupContact).default([]),
  guardianIds: z.array(UserId).default([]),
});

export const PickupContactForm = PickupContact.omit({ id: true });

export const AnnouncementForm = z.object({
  title: z.string().min(1),
  content: AnnouncementContent,
  scope: AnnouncementScope,
});

export const EventForm = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  kind: EventKind,
  startsAt: z.string().min(1),
  endsAt: z.string().nullable(),
  recurrenceRule: z.string().nullable(),
  scopeRoomIds: z.array(RoomId).nullable(),
});

export const ExportRequestForm = z.object({
  kind: z.enum(['children', 'attendance', 'incidents']),
  rangeStart: z.string().min(1),
  rangeEnd: z.string().min(1),
  roomIds: z.array(RoomId).optional(),
});
