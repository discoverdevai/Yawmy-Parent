# TM1 — Auth Success & Notifications & Daily-log Absent

**Branch:** `feat/tm1-auth-notifications`
**Last updated:** _(update each commit)_
**Current focus:** idle

## Tasks

- [ ] **Contact Nursery** — `apps/parent-app/app/(auth)/contact-nursery.jsx` — Figma node `610:16628`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/notifications.json` (or new namespace if needed — flag to lead)
  - [ ] UI built matching Figma
  - [ ] Data hooks wired
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Sign-up success** — `apps/parent-app/app/(auth)/sign-up-success.jsx` — Figma node `612:27547`
  - [ ] Figma context pulled
  - [ ] i18n keys added
  - [ ] UI built matching Figma
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Activation success** — `apps/parent-app/app/(auth)/activation-success.jsx` — Figma node `598:75039`
  - [ ] Figma context pulled
  - [ ] i18n keys added
  - [ ] UI built matching Figma
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Notification list + empty state** — `apps/parent-app/app/(app)/notifications.jsx` — Figma `598:75949` (populated), `598:75837` (empty)
  - [ ] Figma context pulled for both nodes
  - [ ] i18n keys added in `notifications.json` (en + ar)
  - [ ] UI built (single screen, branches on data length)
  - [ ] Data wired — **NOTE: no notifications domain exists in @nms/data yet.** Use static placeholder data inside the screen and log this as a Note for the tech lead. Lead will add the domain post-review.
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK (both branches)
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Daily-log Absent state** — edit `apps/parent-app/app/(app)/daily-log.jsx` — Figma node `598:76165`
  - [ ] Figma context pulled
  - [ ] i18n keys added (existing namespace — check `attendance.json` or add to `notifications.json` if appropriate, else flag lead)
  - [ ] Absent variant added to existing screen (branch on attendance state)
  - [ ] Existing Present/empty states still render correctly
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**

## In Progress

_(one-liner: which task, started when, what step you're on)_

## Errors / Blockers

_(entry per issue: file:line, what's wrong, what you tried, "open" or "resolved")_

## Notes for tech lead

- The Notification screen has no backing data hook yet — using placeholder data inline. Lead may need to add a `notifications` domain after merge.