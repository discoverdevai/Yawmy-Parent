# TM4 — Profile core, Child profile, Events

**Branch:** `feat/tm4-profile-events`
**Last updated:** _(update each commit)_
**Current focus:** idle

## Tasks

- [ ] **Profile main** — `apps/parent-app/app/(app)/profile/index.jsx` — Figma node `598:77070`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/profile.json`
  - [ ] `useAuth` (current user) + `useChildren` (linked children) wired
  - [ ] UI built (overwrite scaffolded stub)
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Child profile** — `apps/parent-app/app/(app)/profile/child/[id].jsx` — Figma node `598:77267`
  - [ ] Figma context pulled
  - [ ] `useChild(id)` wired
  - [ ] Renders name, photo, DOB, allergies, medical notes, pickup contacts
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Events — upcoming tab** — `apps/parent-app/app/(app)/profile/events.jsx` — Figma node `598:77462`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/event.json`
  - [ ] `SegmentedTabs` from `@nms/ui/primitives/SegmentedTabs` for upcoming / saved
  - [ ] `useEvents` wired; filter for `startsAt >= today`
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Events — saved tab** (same file) — Figma node `598:77541`
  - [ ] **NOTE: no "saved" field on event schema.** Use local state (e.g. AsyncStorage / MMKV via a small util) to track saved event IDs, or flag lead to add a `savedByUserIds` field on the schema. Document choice here.
  - [ ] Filter events to show only saved ones
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**
- [ ] **Events — empty branch** (same file) — Figma node `598:77586`
  - [ ] Render `EmptyState` when both tabs have no items
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**

## In Progress

## Errors / Blockers

## Notes for tech lead

- The event schema doesn't have a "saved by user" concept. For the saved tab, I'll use local persistent storage (MMKV) keyed by `nms.savedEvents`. Flag if you prefer a schema/hook change instead.
- Mock events: 1 upcoming (parent-teacher meeting), 1 holiday. Both upcoming. No past events in the seed.
