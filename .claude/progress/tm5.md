# TM5 — Media & Settings

**Branch:** `feat/tm5-media-settings`
**Last updated:** _(update each commit)_
**Current focus:** idle

## Tasks

### Media

- [ ] **Media Gallery** — `apps/parent-app/app/(app)/profile/media/index.jsx` — Figma node `598:77345`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/media.json`
  - [ ] **NOTE: no `media` domain exists in @nms/data.** Source photos either from (a) child records' `photoUrl` + announcement `imageUrls`, or (b) flag lead to add a media domain. Document choice here.
  - [ ] UI built (overwrite scaffolded stub)
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Media Gallery empty branch** (same file) — Figma node `598:77368`
  - [ ] Render `EmptyState` when no photos
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**
- [ ] **Photo view** — `apps/parent-app/app/(app)/profile/media/[photoId].jsx` — Figma node `598:77458`
  - [ ] Use `expo-image` for the full-size render
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**

### Settings

- [ ] **Quiet hours** — `apps/parent-app/app/(app)/profile/settings/quiet-hours.jsx` — Figma node `598:77145`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/settings.json`
  - [ ] Toggle + time-range pickers; persist locally via MMKV or AsyncStorage
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Privacy & Security (list)** — `apps/parent-app/app/(app)/profile/settings/privacy.jsx` — Figma node `598:77809`
  - [ ] Figma context pulled
  - [ ] List of settings rows (per Figma)
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Privacy & Security (detail)** (same file or sub-route) — Figma node `598:77829`
  - [ ] Detail screen for one of the privacy items
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**
- [ ] **Confirm password** — `apps/parent-app/app/(app)/profile/settings/confirm-password.jsx` — Figma node `598:77856`
  - [ ] Form with single password input + zod schema in `settings-forms.js`
  - [ ] `useAuth` for verification (if hook exists; else flag lead)
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Log out from all devices** — `apps/parent-app/app/(app)/profile/settings/logout-all.jsx` — Figma node `598:77889`
  - [ ] Confirmation screen + `Dialog` for confirm
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Log out** — `apps/parent-app/app/(app)/profile/settings/logout.jsx` — Figma node `598:77927`
  - [ ] Confirmation screen + `useAuth.signOut`
  - [ ] Returns to `(auth)/sign-in` on success
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**

## In Progress

## Errors / Blockers

## Notes for tech lead

- No `media` domain in data layer. I'm sourcing photos from child records + announcement images for now. Flag if you want a real media domain added post-merge.
- Settings persistence will use MMKV (`react-native-mmkv` is already a dependency) since these are per-user-per-device prefs.
