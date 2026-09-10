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
