# Tech Lead Review Log

## Pending review

_(populated as teammates mark tasks DONE)_

## Approved (ready for user's final check)

_(populated after each successful review)_

## Sent back

_(populated when a review fails — include file:line, expected behavior, what to fix)_

## Lead fixes / unblockers

_(scaffolding follow-ups the lead did during the project, e.g. adding a missing data domain)_

## Known tech debt (don't block teammates)

- **Pre-existing lint issues** at scaffold time: `pnpm --filter parent-app lint` reports 3 errors + 29 warnings in existing screens (auth/sign-in.jsx, app/index.jsx, app/_home-after-checkin.jsx, app/attendance/history.jsx, app/daily-log.jsx, app/day-details/[date].jsx). All are pre-existing — none introduced by scaffolding. Teammates run **scoped lint on their new files only**: `npx eslint <their files> --max-warnings=0`. Lead to clean these up in a follow-up `chore: fix pre-existing lint` commit.
- **No `notifications` data domain** in `packages/data`. TM1 will use placeholder data inside the Notification screen. Lead may add the domain post-merge.
- **No `media` data domain.** TM5 will source photos from child records + announcement images. Lead may add a real media domain post-merge.
- **No "saved events" concept on event schema.** TM4 will use MMKV-backed local state.
- **`eslint-plugin-react-native` peer dep**: warns about eslint 9 incompatibility (it only supports up to 8). Non-fatal but worth addressing eventually.
