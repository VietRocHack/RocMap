# 0002. Backend reads bundled local JSON instead of fetching a teammate's GitHub fork at request time

Status: Accepted

## Context

`backend/direction.py`'s `load_data()` fetched `nodes.json`/`edges.json`/`halls.json`
over HTTP from `raw.githubusercontent.com/goodudetheboy/RocMap/data/...` — a
teammate's **personal fork**, on every single request. This meant:

- Every route lookup depended on GitHub staying up and that fork staying public and
  unchanged, for a dataset that already lives in this repo's own `data/` folder.
- An unnecessary network round-trip (and GitHub rate-limit exposure) on the hot path
  of an otherwise pure in-memory Dijkstra computation.
- The function's actual behavior was implicitly coupled to a branch of a repo this
  team doesn't control, not to the code it was deployed from.

The function's source already had the right instinct commented out
(`# nodes_file = open(f"{data_dir}/nodes.json")`) — it just needed the data to
actually be present alongside the deployed code.

## Decision

Copy `data/{nodes,edges,halls}.json` into `backend/data/` (committed to the repo),
and have `load_data()` read them with plain `open()`/`json.load()`. `main.py` passes
an absolute path computed from `os.path.dirname(os.path.abspath(__file__))` rather
than a relative path, so it doesn't depend on the function runtime's working
directory. `backend/data/` gets uploaded as part of the function's source on every
`gcloud functions deploy` (nothing in `backend/.gcloudignore` excludes it).

## Consequences

- The function has zero external dependencies at request time — `requests` was
  dropped from `backend/requirements.txt` entirely.
- Updating the map data now means committing new JSON to `backend/data/` (and the
  top-level `data/` it's copied from) and redeploying the function — not editing a
  fork nobody but one teammate has push access to.
- The two copies of the data (`data/` at repo root, `backend/data/` bundled with the
  function) can drift if only one is edited — acceptable for now given how rarely
  this data changes, but worth automating (e.g. a symlink-at-deploy-time or a build
  step) if the map ever needs frequent updates.
