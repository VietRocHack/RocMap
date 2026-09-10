# Runbook: RocMap on `vietrochack-lab`

Operational checklist for deploying/operating RocMap. See
[docs/adr/0001-deploy-topology.md](adr/0001-deploy-topology.md) for how the deploy
itself works (`scripts/deploy.sh` / `.github/workflows/deploy.yml`).

## One-time setup (done 2026-09-09)

- [x] Firebase enabled on `vietrochack-lab`
      (`firebase projects:addfirebase vietrochack-lab`).
- [x] Cloud Functions / Cloud Run / Cloud Build / Artifact Registry / Eventarc APIs
      enabled on `vietrochack-lab`.
- [x] Dedicated Hosting site created and mapped to the `rocmap` target
      (`firebase hosting:sites:create vietrochack-rocmap`, recorded in
      `.firebaserc` — see
      [docs/adr/0004-resource-siloing-in-shared-project.md](adr/0004-resource-siloing-in-shared-project.md)).
- [x] Custom domain `rocmap.vietrochack.com` requested against the `vietrochack-rocmap`
      Hosting site via the Firebase Hosting Custom Domains API.

## DNS records (add these at Namecheap, on the `vietrochack.com` zone)

These are specific to this domain request — if the custom domain is ever removed
and re-added, fetch fresh values rather than reusing these (the TXT/ACME value is
tied to this specific request):

| Type  | Host                            | Value                                               |
|-------|----------------------------------|------------------------------------------------------|
| CNAME | `rocmap`                         | `vietrochack-rocmap.web.app`                          |
| TXT   | `_acme-challenge.rocmap`         | `vleEIiA2raBaQ0-N-AkSyAwJDjU1KHEaFO03d6Ox-18`         |

After adding both records: DNS propagation + Firebase's automatic SSL cert
provisioning is usually well under 24h. Check status any time with:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -s "https://firebasehosting.googleapis.com/v1beta1/projects/vietrochack-lab/sites/vietrochack-rocmap/customDomains/rocmap.vietrochack.com" \
  -H "Authorization: Bearer $TOKEN" -H "X-Goog-User-Project: vietrochack-lab"
```

`hostState` moves `HOST_UNHOSTED` → `HOST_CONNECTED` once the CNAME resolves and the
cert is live; `ownershipState` moves `OWNERSHIP_MISSING` → `OWNERSHIP_ACCEPTED` once
the TXT record is seen.

## One-time setup for GitHub Actions auto-deploy (done 2026-09-09)

Uses **Workload Identity Federation (WIF)** — no long-lived key stored in GitHub.
See [docs/adr/0005-github-actions-auto-deploy-via-wif.md](adr/0005-github-actions-auto-deploy-via-wif.md)
for the full reasoning; the commands that were run:

```bash
PROJECT_ID="vietrochack-lab"
REPO="VietRocHack/RocMap"
PROJECT_NUMBER="246457606106"
SA_EMAIL="gh-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create gh-actions-deploy \
  --project "$PROJECT_ID" --display-name "GitHub Actions deploy"

for ROLE in roles/cloudfunctions.developer roles/run.admin roles/iam.serviceAccountUser \
            roles/cloudbuild.builds.editor roles/artifactregistry.admin \
            roles/storage.admin roles/firebasehosting.admin; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member "serviceAccount:${SA_EMAIL}" --role "$ROLE"
done

gcloud iam workload-identity-pools create "github" \
  --project="$PROJECT_ID" --location="global" --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc "rocmap" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="github" \
  --display-name="RocMap repo" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == '${REPO}'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${REPO}"
```

GitHub repo variables (Settings → Secrets and variables → Actions → Variables,
already set via `gh variable set`):
- `WORKLOAD_IDENTITY_PROVIDER` =
  `projects/246457606106/locations/global/workloadIdentityPools/github/providers/rocmap`
- `GCP_SERVICE_ACCOUNT` = `gh-actions-deploy@vietrochack-lab.iam.gserviceaccount.com`

No secrets needed at all for this workflow — that's the point of WIF.

## Ongoing (this deploy is meant to stay live indefinitely)

- [x] GCP budget alert on `vietrochack-lab` (done 2026-09-09) — $10/month,
      calendar-month period, scoped to just this project (`--filter-projects`,
      so it doesn't fire on other projects sharing the same billing account),
      alerts at 50%/90%/100% to the billing account's default IAM recipients
      (Billing Account Admins/Users — includes `hochivuong2002@gmail.com`).
      Recreate with:
      ```bash
      gcloud billing budgets create \
        --billing-account=0117FA-0BC569-CCD7E4 \
        --display-name="vietrochack-lab monthly budget" \
        --budget-amount=10USD \
        --calendar-period=month \
        --filter-projects=projects/vietrochack-lab \
        --threshold-rule=percent=0.5 \
        --threshold-rule=percent=0.9 \
        --threshold-rule=percent=1.0 \
        --project=vietrochack-lab
      ```
      (`billingbudgets.googleapis.com` must be enabled on `vietrochack-lab`
      first — `gcloud services enable billingbudgets.googleapis.com
      --project=vietrochack-lab` — since `gcloud billing budgets create` uses
      `--project` as its quota project, not a resource scope.) Raise the
      $10 amount once more apps are actually running here and real spend
      is expected.
- [x] Artifact Registry cleanup policy on the `gcf-artifacts` repo (done
      2026-09-09) — every `gcloud functions deploy` (including the one that
      now runs on every push to `main` via GitHub Actions) builds a new
      container image that Artifact Registry does NOT auto-delete on its own;
      left unchecked this slowly accumulates storage cost. Policy: keep the 3
      most recent image versions always (rollback safety), delete untagged
      images after 1 day, delete anything (tagged or not) older than 90 days.
      Recreate with:
      ```bash
      gcloud artifacts repositories set-cleanup-policies gcf-artifacts \
        --project=vietrochack-lab --location=us-central1 \
        --policy=docs/gcf-artifacts-cleanup-policy.json --no-dry-run
      ```
- [ ] Periodically check `gcloud functions describe rocmap-findDirection
      --project vietrochack-lab --region us-central1` and the Firebase Hosting
      console for the site are both still healthy.

## Adding another app to `vietrochack-lab`

Read [docs/adr/0004-resource-siloing-in-shared-project.md](adr/0004-resource-siloing-in-shared-project.md)
first — it records the naming/siloing convention (function name prefix, dedicated
Hosting site, dedicated database if needed) this project expects every app to
follow.
