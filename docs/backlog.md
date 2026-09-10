# Backlog

Living checklist of known non-blocking issues and cleanup. Not a replacement for
`docs/progress/` — check items off here as they land, but the "what changed and
why" narrative for each still goes in that day's progress file.

Seeded 2026-09-09 during the re-hosting of RocMap onto `vietrochack-lab` (see
[docs/progress/20260909.md](progress/20260909.md)).

## Known non-blocking issues

- [ ] `find_shortest_path` in `backend/direction.py` marks `seen` by **edge id**,
  not by **node id** — non-standard Dijkstra (a node can be revisited via a
  different incoming edge). Not something the redeploy changed or was asked to
  fix; flagged in
  [docs/adr/0001-deploy-topology.md](adr/0001-deploy-topology.md)'s companion
  discussion as worth revisiting separately if correctness issues ever show up
  on a larger graph.
- [ ] `data/` (repo root) and `backend/data/` are two separate copies of the same
  JSON, kept in sync manually — see the Consequences section of
  [docs/adr/0002-backend-reads-bundled-local-data.md](adr/0002-backend-reads-bundled-local-data.md).
  Fine while the map data changes rarely; automate (symlink or a build step) if
  it starts changing often.
- [ ] No automated tests for either `front-end/roc-map` or `backend/` — deploys are
  currently verified manually (see `docs/runbook.md`'s pre-deploy checklist).
- [ ] `data/` and `front-end/roc-map/public/images/` are also two separate copies
  of the step images now, same manual-sync caveat as the JSON data above.

## Phase 0 — re-hosting onto `vietrochack-lab` — done 2026-09-09

- [x] Backend reads bundled local data instead of fetching a teammate's GitHub
  fork at request time
- [x] Images served as static Hosting assets instead of a teammate's personal
  Firebase Storage bucket
- [x] Frontend calls a same-origin `/api/findDirection` instead of a teammate's
  personal Cloud Function URL
- [x] Deployed to a dedicated `vietrochack-rocmap` Hosting site + `rocmap-findDirection`
  function in `vietrochack-lab`, custom domain `rocmap.vietrochack.com` requested
- [x] `scripts/deploy.sh` + `.github/workflows/deploy.yml` (Workload Identity
  Federation, no stored key) for manual and automatic redeploys
- [x] Removed dead `front-end/roc-map/src/utils/fetchData.js` and the stray root
  `package.json` (unused `@syncfusion` dependency)

## Phase 1 — cost safety net — done 2026-09-09

- [x] GCP budget alert on `vietrochack-lab` ($10/month, 50/90/100% thresholds,
  scoped to just this project) — see `docs/runbook.md`
- [x] Artifact Registry cleanup policy on `gcf-artifacts` (keep 3 most recent
  images, delete untagged after 1 day, delete anything older than 90 days) —
  prevents CI-triggered deploys from silently accumulating storage cost over
  time; see `docs/gcf-artifacts-cleanup-policy.json` and `docs/runbook.md`

## Phase 2 — frontend polish (desktop responsiveness, bug fixes) — done 2026-09-09

- [x] Real desktop layout: `.pop-up-container`/`.info-title`/`.clarify-info`/
  `.button-in-container` had zero styling above 1200px (only ever declared
  inside the mobile media query) — moved to base `App.css` so they render at
  every width
- [x] Two-column result grid + row-layout weather pills at `min-width: 900px`,
  centered `max-width: 1100px` content column at every width
- [x] Fixed a real crash risk (`showResultDiv` reading `selectedEndLocation.id`
  with no guard) — Submit is now disabled until the form is actually complete
- [x] Fixed the "result flashes empty before data arrives" bug + added a real
  loading state and inline error handling (previously a bare `alert()`, and
  only on the `!res.ok` path — network failures were unhandled)
- [x] Fixed stale `startDoorId` surviving a changed "From" selection
- [x] Fixed 4 `class=`/`className=` React warnings
- [x] "Find another route" now fully resets form/selection state instead of
  only toggling the view
- [x] Empty "Start"/"Destination" now show a "Not selected yet" placeholder
  instead of rendering blank
- [x] Weather rating radios restyled as pill buttons matching the app's
  existing button look, replacing bare browser-default radios
- [x] VietRocHack `icon.svg` wired up as the real favicon and a small
  persistent top-left nav header (fades in past the hero, click to scroll to
  top)
- [x] Added a site footer (copyright + vietrochack.com + Devpost links) —
  intended as a standard for future VietRocHack subdomain apps too
- [x] Fixed local `npm start` (broken since the API URL became relative) via
  a `proxy` field in `package.json`; added `.claude/launch.json`
- [x] Wrote a real root `README.md`
