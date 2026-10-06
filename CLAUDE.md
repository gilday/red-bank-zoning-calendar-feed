# Red Bank Zoning Calendar Feed

A Cloudflare Worker that filters the Red Bank borough Main Calendar iCalendar feed down to Zoning Board and Planning Board meetings.

## Layout

- `src/filter.js` — `filterIcs(ics, pattern)`, `UPSTREAM_URL`, `DEFAULT_PATTERN`
- `src/worker.js` — Worker `fetch` handler
- `test/*.test.js` — `node:test` suites; `worker.test.js` replaces `globalThis.fetch`
- `justfile` — `test`, `dev`, `deploy`, `live`

## Commands

- `just test` before every commit
- `just live` to check the filter against the real borough feed
- `just deploy` publishes to the user's Cloudflare account; run it only when the user asks

## Conventions

- Plain ES modules, no dependencies, no build step.
- Parse iCalendar by unfolding continuation lines first, then splitting at `BEGIN:VEVENT` / `END:VEVENT`. Everything outside VEVENT blocks (VTIMEZONE, calendar properties) passes through unchanged.
- Add a test in `test/filter.test.js` for every change to matching or output shape.
- Commit subjects start with a gitmoji character, imperative mood.
