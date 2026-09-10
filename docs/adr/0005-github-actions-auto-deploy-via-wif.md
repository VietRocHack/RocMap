# 0005. GitHub Actions auto-deploy via Workload Identity Federation (no stored key)

Status: Accepted

## Context

[0001](0001-deploy-topology.md) established the two-step manual deploy
(`scripts/deploy.sh`): Cloud Function, then Firebase Hosting. The user asked for
this to also happen automatically on push to `main`, without needing anyone to
run the script by hand.

The naive way to authenticate a GitHub Actions workflow against GCP is a
long-lived JSON service-account key, pasted into a GitHub Actions secret. That's a
standing credential sitting in a third-party platform — if the repo or the secret
ever leaks, it's a live GCP credential with no expiry until someone manually
rotates it.

## Decision

Use **Workload Identity Federation (WIF)** instead: GitHub proves its identity to
GCP per workflow run via an OIDC token, and GCP exchanges it for a short-lived
credential — no key file is ever created, stored, or downloaded.

One-time setup (already done for this repo, recorded here so it doesn't need
rediscovering):

- Service account `gh-actions-deploy@vietrochack-lab.iam.gserviceaccount.com`,
  granted exactly the roles the deploy needs: `roles/cloudfunctions.developer`,
  `roles/run.admin` (gen2 functions are backed by Cloud Run), `roles/iam.serviceAccountUser`,
  `roles/cloudbuild.builds.editor`, `roles/artifactregistry.admin`,
  `roles/storage.admin`, `roles/firebasehosting.admin`.
- A Workload Identity Pool (`github`) and OIDC provider (`rocmap`) in
  `vietrochack-lab`, trusting `https://token.actions.githubusercontent.com`, with
  an **attribute-condition restricting it to this exact repo**
  (`assertion.repository == 'VietRocHack/RocMap'`) — not just the GitHub org, so no
  other repo can impersonate the deploy service account even if compromised.
- The service account grants `roles/iam.workloadIdentityUser` to that provider's
  principal set, scoped to the same repo condition.
- `WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT` are stored as GitHub repo
  **variables** (not secrets) — the provider/service-account identifiers aren't
  sensitive, the security boundary is the attribute-condition, not obscurity.
  `.github/workflows/deploy.yml` needs no secrets at all.

## Consequences

- Re-running the workflow (push to `main`, or manual `workflow_dispatch`) is safe —
  `gcloud functions deploy` and `firebase deploy` are both idempotent.
- If this repo is ever forked or renamed, the attribute-condition needs updating —
  a fork would otherwise be unable to deploy (correct default), a rename would need
  the condition string updated to match.
- Anyone adding a new app to `vietrochack-lab` with its own repo should set up a
  **separate** service account + OIDC provider scoped to *that* repo, following
  this same pattern — not reuse `gh-actions-deploy`, which is scoped to RocMap's
  deploy permissions specifically.
