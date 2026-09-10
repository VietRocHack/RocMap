# RocMap

Find your way around campus, tunnels included.

**Live at [rocmap.vietrochack.com](https://rocmap.vietrochack.com)**

RocMap was built by [VietRocHack](https://vietrochack.com) at a hackathon to
solve a real problem: first years (and Google Maps) get lost trying to find
the right intersection or the right tunnel between buildings on the University
of Rochester's Eastman Quad. Type where you are and where you're going, and
RocMap walks you there step by step with real photos of each turn.

## How it works

Every hallway, door, and tunnel intersection on the Quad is a node in a graph,
hand mapped by the team. RocMap runs Dijkstra's algorithm over that graph to
find the shortest path between your start and destination, then shows you
each leg of the route as a photo with directions.

Tell it the weather, and the routing changes with it. Bad weather makes the
algorithm weight outdoor paths higher, so on a rainy or snowy day it will
naturally favor the tunnels instead.

## Stack

- **Frontend**: React, plain CSS, deployed on Firebase Hosting
- **Backend**: a single Python Cloud Function running the pathfinding, deployed
  on Google Cloud Functions
- **Data**: hand curated JSON (nodes, edges, and door metadata) plus the
  photos for each step, both committed straight into this repo

Frontend and backend share one domain. Firebase Hosting routes `/api/**` to
the Cloud Function, so there's no separate API host and no CORS to think
about.

## Project layout

```
front-end/roc-map/   React app
backend/              Python Cloud Function
data/                 the graph: nodes, edges, halls, and step photos
docs/                 architecture decisions, runbook, progress log
```

## Running it locally

```bash
cd front-end/roc-map
npm install
npm start
```

This talks to the live backend by default (see the `proxy` field in
`package.json`), so you get real routes and real images without running
anything else locally.

To work on the backend itself:

```bash
cd backend
pip install -r requirements.txt
functions-framework --target=find_direction --source=main.py
```

## Deploying

```bash
bash scripts/deploy.sh
```

Pushing to `main` also deploys automatically. See
[`docs/runbook.md`](docs/runbook.md) for the one time setup behind that, and
[`docs/adr/`](docs/adr) for the reasoning behind how this is all wired
together.

## Credits

Built by the VietRocHack team. Read the original pitch on
[Devpost](https://devpost.com/software/rocmap).

## License

MIT, see [LICENSE](LICENSE).
