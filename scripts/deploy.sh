#!/usr/bin/env bash
set -euo pipefail

# Deploys the backend to Cloud Functions (gen2) and the frontend to Firebase
# Hosting's "rocmap" site, both in the vietrochack-lab GCP project. See
# docs/adr/0001-deploy-topology.md for why, and docs/runbook.md for the
# one-time setup this script assumes is already done.
#
# Run from anywhere: bash scripts/deploy.sh

cd "$(dirname "${BASH_SOURCE[0]}")/.."  # repo root

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-vietrochack-lab}"
REGION="${REGION:-us-central1}"
FUNCTION_NAME="${FUNCTION_NAME:-rocmap-findDirection}"

echo "==> Checking required tools..."
command -v gcloud >/dev/null || {
  echo "gcloud CLI not found — https://cloud.google.com/sdk/docs/install"
  exit 1
}
command -v firebase >/dev/null || {
  echo "firebase CLI not found — run: npm install -g firebase-tools"
  exit 1
}

echo "==> Deploying backend to Cloud Functions (gen2)"
echo "    function: $FUNCTION_NAME   project: $PROJECT_ID   region: $REGION"
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime=python312 \
  --region "$REGION" \
  --source=backend \
  --entry-point=find_direction \
  --trigger-http \
  --allow-unauthenticated \
  --project "$PROJECT_ID"

echo "==> Building frontend..."
(cd front-end/roc-map && CI=false npm run build)

echo "==> Deploying frontend to Firebase Hosting (rocmap site)"
firebase deploy --only hosting:rocmap --project "$PROJECT_ID"

echo ""
echo "==> Done."
echo "Live at: https://rocmap.vietrochack.com"
echo ""
echo "Reminder: docs/runbook.md has the one-time setup checklist (DNS,"
echo "budget alert) if this is the first deploy."
