# 0003. Step-direction images served as static Hosting assets, not Firebase Storage

Status: Accepted

## Context

`backend/main.py`'s `get_image_url()` built URLs against
`firebasestorage.googleapis.com/.../rocmap.appspot.com/...` — another teammate's
personal Firebase Storage bucket. The 70 step-direction images
(`data/images/*.png`) are small, static, and change only when the campus map data
itself changes (i.e. rarely, by a human editing `data/`, not at runtime).

A Cloud Storage bucket would need its own bucket creation, public-read IAM
bindings (or signed URLs), and a place to record that bucket's name — real
plumbing for files that don't need any of Storage's dynamic-upload or
access-control features.

## Decision

Ship `data/images/*.png` as static files under `front-end/roc-map/public/images/`,
served directly by Firebase Hosting. `get_image_url()` now returns a same-origin
relative path (`/images/{raw}`) instead of an absolute Storage URL.

## Consequences

- No bucket, no IAM, no signed URLs — one less resource to provision and secure per
  app in the shared `vietrochack-lab` project.
- Adding/updating a step image means adding the file to `front-end/roc-map/public/
  images/` (and `data/images/`) and redeploying Hosting — same "commit + deploy"
  loop as the JSON data in [0002](0002-backend-reads-bundled-local-data.md), not a
  separate upload step.
- If RocMap ever needs *user-uploaded* images (not hand-curated hackathon assets),
  that's a different problem and Cloud Storage becomes the right tool again — this
  ADR is about the current fixed, small, developer-owned asset set only.
