# TM3 — News (Announcement)

**Branch:** `feat/tm3-news`
**Last updated:** _(update each commit)_
**Current focus:** idle

## Tasks

- [ ] **Announcement list** — `apps/parent-app/app/(app)/news/index.jsx` — Figma node `598:76886`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/announcement.json`
  - [ ] `useAnnouncements` hook wired
  - [ ] UI built matching Figma (overwrite the scaffolded stub)
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Empty-state branch** (in list screen) — Figma node `598:76900`
  - [ ] Branch when announcements list is empty
  - [ ] Use `EmptyState` from `@nms/ui/primitives/EmptyState`
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**
- [ ] **Details — with-media variant** — `apps/parent-app/app/(app)/news/[id].jsx` — Figma node `598:77013`
  - [ ] Figma context pulled
  - [ ] Render announcement title, body, and `content.imageUrls[]` carousel
  - [ ] Use `expo-image` for media (already a dependency)
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Details — text-only variant** (same file, branch by data) — Figma node `598:77034`
  - [ ] Render gracefully when `content.imageUrls` is empty
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**

## In Progress

## Errors / Blockers

## Notes for tech lead

- Mock data has 3 announcements seeded: 2 text-only (welcome back, Sunshine Room field trip) and 1 with `imageUrls` populated (Photos from the garden trip). Use these to verify both variants.
- Parent role is read-only for announcements; do NOT surface Create/Edit/Delete UI without flagging here.
