/**
 * @typedef {import('./tenant-scope').TenantScope} TenantScope
 *
 * @typedef {object} AuthClient
 * @property {(email: string, password: string) => Promise<import('@nms/schemas').Session>} signIn
 * @property {() => Promise<void>} signOut
 * @property {() => Promise<void>} signOutAllDevices
 * @property {(email: string) => Promise<{ token: string, resendAvailableInSeconds: number }>} requestPasswordResetOtp
 * @property {(resetToken: string, code: string) => Promise<{ resetToken: string }>} verifyOtp
 * @property {(resetToken: string) => Promise<{ token: string, resendAvailableInSeconds: number }>} resendResetOtp
 * @property {(resetToken: string, newPassword: string) => Promise<void>} completePasswordReset
 * @property {(currentPassword: string, newPassword: string) => Promise<void>} changePassword
 * @property {(email: string) => Promise<void>} forgotPassword
 * @property {(token: string, newPassword: string) => Promise<void>} resetPassword
 * @property {(token: string) => Promise<{ nursery: import('@nms/schemas').Nursery, invite: import('@nms/schemas').Invite }>} validateInvite
 * @property {(token: string, password: string) => Promise<import('@nms/schemas').Session>} acceptInvite
 * @property {() => Promise<import('@nms/schemas').User>} me
 *
 * @typedef {object} NurseryClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Nursery>} get
 * @property {(scope: TenantScope, patch: Partial<import('@nms/schemas').Nursery>) => Promise<import('@nms/schemas').Nursery>} update
 * @property {(scope: TenantScope, geofence: import('@nms/schemas').Geofence) => Promise<import('@nms/schemas').Nursery>} updateGeofence
 *
 * @typedef {object} RoomsClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Room[]>} list
 * @property {(scope: TenantScope, id: string) => Promise<import('@nms/schemas').Room>} get
 * @property {(scope: TenantScope, input: any) => Promise<import('@nms/schemas').Room>} create
 * @property {(scope: TenantScope, id: string, patch: any) => Promise<import('@nms/schemas').Room>} update
 * @property {(scope: TenantScope, id: string) => Promise<void>} archive
 * @property {(scope: TenantScope, id: string, teacherIds: string[]) => Promise<import('@nms/schemas').Room>} assignTeachers
 *
 * @typedef {object} ChildrenClient
 * @property {(scope: TenantScope, params?: { roomId?: string }) => Promise<import('@nms/schemas').Child[]>} list
 * @property {(scope: TenantScope, id: string) => Promise<import('@nms/schemas').Child>} get
 * @property {(scope: TenantScope, input: any) => Promise<import('@nms/schemas').Child>} create
 * @property {(scope: TenantScope, id: string, patch: any) => Promise<import('@nms/schemas').Child>} update
 * @property {(scope: TenantScope, id: string) => Promise<void>} unenroll
 * @property {(scope: TenantScope, id: string, contact: any) => Promise<import('@nms/schemas').PickupContact>} addPickupContact
 * @property {(scope: TenantScope, id: string, contactId: string) => Promise<void>} removePickupContact
 *
 * @typedef {object} EnrollmentClient
 * @property {(scope: TenantScope, input: { email: string, name: string, role: 'admin'|'teacher', phone?: string }) => Promise<import('@nms/schemas').Invite>} inviteStaff
 * @property {(scope: TenantScope, input: { email: string, name: string, phone?: string, childIds: string[] }) => Promise<import('@nms/schemas').Invite>} inviteParent
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').User[]>} listUsers
 *
 * @typedef {object} AttendanceClient
 * @property {(scope: TenantScope, params?: { roomId?: string, on?: string }) => Promise<import('@nms/schemas').AttendanceRecord[]>} list
 * @property {(scope: TenantScope, input: { childId: string, method: 'geofence'|'manual' }) => Promise<import('@nms/schemas').AttendanceRecord>} checkIn
 * @property {(scope: TenantScope, attendanceId: string) => Promise<import('@nms/schemas').AttendanceRecord>} checkOut
 *
 * @typedef {object} IncidentsClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Incident[]>} list
 * @property {(scope: TenantScope, id: string) => Promise<import('@nms/schemas').Incident>} get
 *
 * @typedef {object} AnnouncementsClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Announcement[]>} list
 * @property {(scope: TenantScope, input: any) => Promise<import('@nms/schemas').Announcement>} create
 * @property {(scope: TenantScope, id: string, patch: any) => Promise<import('@nms/schemas').Announcement>} update
 * @property {(scope: TenantScope, id: string) => Promise<void>} remove
 *
 * @typedef {object} EventsClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Event[]>} list
 * @property {(scope: TenantScope, input: any) => Promise<import('@nms/schemas').Event>} create
 * @property {(scope: TenantScope, id: string, patch: any) => Promise<import('@nms/schemas').Event>} update
 * @property {(scope: TenantScope, id: string) => Promise<void>} remove
 *
 * @typedef {object} ChatClient
 * @property {(scope: TenantScope) => Promise<import('@nms/schemas').Thread[]>} listThreads
 * @property {(scope: TenantScope, threadId: string, params?: { cursor?: string }) => Promise<{ items: import('@nms/schemas').Message[], nextCursor: string|null }>} listMessages
 * @property {(scope: TenantScope, threadId: string, body: string) => Promise<import('@nms/schemas').Message>} send
 * @property {(scope: TenantScope, threadId: string, messageId: string) => Promise<void>} removeMessage
 * @property {(scope: TenantScope, threadId: string, userId: string) => Promise<void>} muteUser
 * @property {(scope: TenantScope, input: { scope: 'nursery'|'rooms', roomIds?: string[], body: string }) => Promise<void>} broadcast
 *
 * @typedef {object} ExportClient
 * @property {(scope: TenantScope, input: { kind: 'children'|'attendance'|'incidents', rangeStart: string, rangeEnd: string, roomIds?: string[] }) => Promise<{ jobId: string }>} request
 * @property {(scope: TenantScope, jobId: string) => Promise<{ status: 'pending'|'ready'|'failed', csv?: string, error?: string }>} status
 *
 * @typedef {object} ApiClients
 * @property {AuthClient} auth
 * @property {NurseryClient} nursery
 * @property {RoomsClient} rooms
 * @property {ChildrenClient} children
 * @property {EnrollmentClient} enrollment
 * @property {AttendanceClient} attendance
 * @property {IncidentsClient} incidents
 * @property {AnnouncementsClient} announcements
 * @property {EventsClient} events
 * @property {ChatClient} chat
 * @property {ExportClient} export
 */

export {};
