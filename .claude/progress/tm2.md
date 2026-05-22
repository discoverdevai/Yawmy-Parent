# TM2 — Chat

**Branch:** `feat/tm2-chat`
**Last updated:** _(update each commit)_
**Current focus:** idle

## Tasks

- [ ] **Chat list** — `apps/parent-app/app/(app)/chat/index.jsx` — Figma node `598:76474`
  - [ ] Figma context pulled
  - [ ] i18n keys added in `packages/i18n/src/locales/{en,ar}/chat.json`
  - [ ] UI built matching Figma (overwrite the scaffolded stub)
  - [ ] `useThreads` hook wired
  - [ ] Empty state when no threads (demoParent2 has a thread; demoParent does not — flip between accounts)
  - [ ] Lint passes
  - [ ] Babel transform check passes
  - [ ] Visual check vs Figma OK
  - [ ] Smoke test in Expo OK
  - [ ] **Marked DONE for review**
- [ ] **Thread view** — `apps/parent-app/app/(app)/chat/[threadId].jsx` — Figma node `598:76508`
  - [ ] Figma context pulled
  - [ ] `useThreadMessages` + `useSendMessage` wired
  - [ ] Composer + bubble list rendered
  - [ ] Read receipts shown using `readBy` field
  - [ ] Lint + babel + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Typing-indicator state** (state in thread view) — Figma node `598:76666`
  - [ ] Local UI state for "remote user typing"
  - [ ] Conditional bubble at bottom of message list
  - [ ] Visual check vs Figma OK
  - [ ] **Marked DONE for review**
- [ ] **Emoji reactions sheet** — `apps/parent-app/app/(app)/chat/_components/EmojiReactionsSheet.jsx` — Figma node `598:76737`
  - [ ] Use `BottomSheet` from `@nms/ui/primitives/BottomSheet`
  - [ ] Long-press a message bubble to open
  - [ ] Tapping an emoji updates `reactions[]` on the message via `useSendMessage`-like flow (check hook surface; if missing, flag lead)
  - [ ] Visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Reply composer state** (state in thread view) — Figma node `598:76817`
  - [ ] Tap a message → "Reply" → composer shows the quoted message above input
  - [ ] Send sets `replyToId` on the new message
  - [ ] Lint + visual + smoke pass
  - [ ] **Marked DONE for review**
- [ ] **Thread-menu sheet** — `apps/parent-app/app/(app)/chat/_components/ThreadMenuSheet.jsx` — Figma node `598:76581`
  - [ ] Use `BottomSheet`
  - [ ] Opens from a header IconButton
  - [ ] Items: Mute, View members, Clear chat (Mute hook may not exist — flag lead)
  - [ ] Lint + visual + smoke pass
  - [ ] **Marked DONE for review**

## In Progress

## Errors / Blockers

## Notes for tech lead

- Sign in as `parent2@nms.local` / `password123` to see a seeded direct thread with teacher1 and three messages. `parent@nms.local` has an empty thread list (use it to test the empty state).
- `useSendMessage` exists; mute/reaction-toggle hooks may need to be added — flag here if you hit a wall.
