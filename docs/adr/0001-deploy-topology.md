# 0001. Deploy topology: Firebase Hosting + Cloud Functions gen2, same GCP project, same origin

Status: Accepted

## Context

RocMap was built during a hackathon on infrastructure that belonged to individual
teammates: the frontend called a Cloud Function on one teammate's personal Firebase
project, which in turn fetched its graph data from a different teammate's personal
GitHub fork. None of it lived under the team's own `vietrochack-lab` GCP project, so
it could disappear the moment either teammate deleted their personal project. The
goal is to re-host everything inside `vietrochack-lab`, reachable forever at
`rocmap.vietrochack.com`.

The backend is a single Python function already written against the
`functions_framework` decorator (`backend/main.py`) — not an Express/Node service
like some other VietRocHack projects. Porting it to Cloud Run (the pattern used
elsewhere) would mean rewriting it as a long-running HTTP server for no benefit;
Cloud Functions gen2 runs the exact same code with no rewrite.

A separate `api.vietrochack.com`-style subdomain for the backend was considered and
rejected — it would need its own DNS record and would reintroduce CORS, which the
old hackathon version already had to work around with a wildcard
`Access-Control-Allow-Origin: *`.

## Decision

- **Backend** → Cloud Functions gen2 (Python 3.12), deployed via
  `gcloud functions deploy rocmap-findDirection --gen2 --source=backend
  --entry-point=find_direction --trigger-http --allow-unauthenticated`, in
  `us-central1`, in the `vietrochack-lab` project.
- **Frontend** → Firebase Hosting, on a **dedicated Hosting site** (`vietrochack-rocmap`,
  not the project's default site — see
  [0004](0004-resource-siloing-in-shared-project.md)), deployed via
  `firebase deploy --only hosting:rocmap` from `front-end/roc-map/build`.
- **Same origin, no CORS**: `firebase.json`'s Hosting config rewrites `/api/**` to
  the `rocmap-findDirection` function, so the browser only ever talks to
  `rocmap.vietrochack.com` — no second subdomain, no CORS headers to maintain.
- `scripts/deploy.sh` does both steps in order; `.github/workflows/deploy.yml`
  automates the same two steps on push to `main` (see
  [0005](0005-github-actions-auto-deploy-via-wif.md)).

## Consequences

- Redeploying the backend is a single `gcloud functions deploy` — no Dockerfile,
  no Cloud Run service definition to maintain.
- The frontend must be rebuilt (not just redeployed) after any backend contract
  change, same as any static-site deploy — this doesn't need a fresh build for the
  backend's *URL* the way a separate-origin setup would, since the frontend only
  ever calls the relative path `/api/findDirection`.
- If a future app in `vietrochack-lab` needs a genuinely long-running backend
  process (background jobs, websockets), Cloud Run is still the right tool for
  *that* app — this ADR is specific to RocMap's already-stateless single-function
  shape, not a blanket rule against Cloud Run in this project.
