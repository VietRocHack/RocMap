# 0004. Resource-naming/siloing convention for the shared `vietrochack-lab` project

Status: Accepted

## Context

`vietrochack-lab` is meant to host many VietRocHack hackathon projects going
forward, not just RocMap. Without a convention, function names, Hosting sites,
databases, and buckets from different apps would collide or blur together in one
project's resource list — `gcloud functions list` and the Firebase console become
unreadable once there are 5+ unrelated apps in here, and a bare resource name like
`findDirection` or the project's default Hosting site gives no signal about which
app owns it or whether it's safe to change.

## Decision

- **Cloud Functions**: prefix every function name with the app —
  `rocmap-findDirection`, not `findDirection`. Function names are unique per
  region within a project, and the prefix makes ownership obvious in listings.
- **Firebase Hosting**: never deploy to the project's default Hosting site. Each
  app gets its **own named Hosting site** (RocMap's is `vietrochack-rocmap` — plain
  `rocmap` was already taken globally, Hosting site IDs being globally unique
  across all Firebase projects, not just this one), mapped to a **Hosting target**
  recorded in `.firebaserc` (`rocmap` → `vietrochack-rocmap`) and referenced by
  that target name in `firebase.json`. This gives each app its own site ID, its own
  custom-domain binding, and its own `firebase deploy --only hosting:<target>` —
  no shared "default" site accumulating unrelated rewrites over time.
- **If a future app needs a database**: use a **dedicated named Firestore database
  per app** (`gcloud firestore databases create --database=<app-name>`), not the
  project's `(default)` database shared across apps. Firestore supports multiple
  named databases per project — this keeps each app's collections, security rules,
  and backups physically separate.
- **If a future app needs Cloud Storage**: give it its own bucket (e.g.
  `vietrochack-lab-<app-name>`) rather than a shared bucket with path prefixes —
  bucket-level IAM and lifecycle rules are then per-app for free.

RocMap itself needs no database — no Firestore/Datastore usage, images are static
Hosting assets (see [0003](0003-images-as-static-hosting-assets.md)) — so the
database/bucket rules above are forward-looking, recorded here so the next app in
this project has a convention to follow instead of reinventing one.

## Consequences

- Slightly more setup per app (a dedicated Hosting site + target instead of just
  deploying to default) — worth it once there's more than one app in the project,
  which is the explicit plan for `vietrochack-lab`.
- Anyone adding a new app to `vietrochack-lab` should read this ADR first and
  follow the same `<app>-` / dedicated-site / dedicated-database pattern rather
  than defaulting to whatever's fastest to type.
