# docs/

- **`adr/`** — architecture decision records. One file per decision, numbered in the
  order made. Read before changing anything architectural; add a new ADR (don't
  silently deviate) if a decision changes.
- **`product/`** — the business/product context: the Devpost pitch, what RocMap is
  and why it exists, as distinct from how it's built.
- **`progress/`** — one file per calendar day, `YYYYMMDD.md`, with a `##` section per
  session/chunk of work within that day. See [CLAUDE.md](../CLAUDE.md) for the
  logging mechanism.
- **`runbook.md`** — operational checklist for deploying/operating RocMap in the
  `vietrochack-lab` GCP project.
- **`backlog.md`** — living checklist of known non-blocking issues/cleanup, grouped
  by phase. Check items off as they land; the "what changed and why" narrative
  still goes in `progress/`.
