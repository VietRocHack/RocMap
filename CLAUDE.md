# CLAUDE.md

RocMap — campus wayfinding web app, built during a VietRocHack hackathon. Takes a
start door + destination hall (and current weather), returns a step-by-step image
route via Dijkstra's shortest path over a hand-built graph of UofR's Eastman Quad.
See `docs/product/pitch.md` for the full pitch.

## Repo map

- `front-end/roc-map/` — Create React App UI. Talks to the backend via a relative
  `/api/findDirection` (same-origin, routed through Firebase Hosting — see
  `docs/adr/0001-deploy-topology.md`). Step-direction images live in
  `front-end/roc-map/public/images/`.
- `backend/` — single Python Cloud Function (`functions_framework`), deployed as
  `rocmap-findDirection`. Reads its graph data from `backend/data/` (bundled with
  the function, not fetched over the network — see
  `docs/adr/0002-backend-reads-bundled-local-data.md`).
- `data/` — source-of-truth graph data (`nodes.json`/`edges.json`/`halls.json`) and
  the step images, copied into `backend/data/` and
  `front-end/roc-map/public/images/` respectively for deployment.
- `scripts/deploy.sh` — manual deploy (backend function + frontend Hosting).
- `.github/workflows/deploy.yml` — same deploy, automated on push to `main`.
- `docs/` — see `docs/README.md`.

## Before changing anything architectural

Read `docs/adr/` first. Each file is one decision with its reasoning. If you're
about to make a different choice than what's recorded there, add a new ADR (or
mark the old one superseded) — don't silently deviate.

For business/product context (why this exists, who it's for), read
`docs/product/pitch.md`.

## Progress logging — one file per day, not per session

`docs/progress/YYYYMMDD.md` — **one file per calendar day**, not one per session or
per chunk of work. At the end of a work session (or a meaningfully complete chunk),
append a `## HH:MM — title` section to **today's** file summarizing:
- What changed
- Decisions made (and whether they need a new/updated ADR)
- Open TODOs / what's blocked and on what

If today's file doesn't exist yet, create it. If it does, add a new `##` section to
it — don't create a second file for the same day. Only start a new file when the
calendar date changes. Edit a prior day's file only to fix an error in it, not to
add new entries — new entries always go in today's file.

At the **start** of a session, read the most recent file in `docs/progress/` (sorted
by filename) to see where things left off before doing anything else.

## Running things

```bash
# Frontend, local dev
cd front-end/roc-map
npm install
npm start                  # http://localhost:3000 — calls the deployed backend
                            # unless you point it at a local function emulator

# Backend, local dev
cd backend
pip install -r requirements.txt
functions-framework --target=find_direction --source=main.py

# Deploy (both steps, manual)
bash scripts/deploy.sh

# Deploy (automatic, on push to main)
# — handled by .github/workflows/deploy.yml, no local action needed
```

Requires `gcloud` authenticated with deploy permissions on `vietrochack-lab`
(`gcloud auth login`) and `firebase login` for manual deploys — see
`docs/runbook.md` for the one-time project setup this assumes.

## No test suite (yet)

There's no automated test suite for either `front-end/roc-map` or `backend/` —
`backend/test_http.py` exists but isn't wired into CI. Verify changes by running
the app locally (see above) and exercising the actual route-search flow, or via
`docs/runbook.md`'s manual verification steps after a deploy. If you add real
tests, wire them into `.github/workflows/deploy.yml` (or a separate CI workflow)
rather than leaving them to be run by hand.
