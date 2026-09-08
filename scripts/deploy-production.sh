#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
: "${DEPLOY_CONFIRM:?Set DEPLOY_CONFIRM=YES to run production deployment.}"
[[ "$DEPLOY_CONFIRM" == "YES" ]] || { echo "Production deployment cancelled." >&2; exit 1; }
EXPECTED_BRANCH="${DEPLOY_BRANCH:-main}"
CURRENT_BRANCH="$(git branch --show-current)"
[[ "$CURRENT_BRANCH" == "$EXPECTED_BRANCH" ]] || { echo "Deploy only from $EXPECTED_BRANCH (current: $CURRENT_BRANCH)." >&2; exit 1; }
git diff --quiet && git diff --cached --quiet || { echo "Working tree has uncommitted changes; deployment stopped." >&2; exit 1; }
git fetch origin "$EXPECTED_BRANCH" --quiet
git diff --quiet "origin/$EXPECTED_BRANCH"...HEAD || { echo "Local HEAD differs from origin/$EXPECTED_BRANCH; deployment stopped." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is required" >&2; exit 1; }
pushd backend >/dev/null
npm ci
npm run build
npm test -- --reporter=verbose
popd >/dev/null
if [[ -n "${FIREBASE_PROJECT_ID:-}" ]]; then
  command -v firebase >/dev/null || { echo "Firebase CLI is required when FIREBASE_PROJECT_ID is set" >&2; exit 1; }
  firebase use "$FIREBASE_PROJECT_ID"
  firebase deploy --only firestore:indexes
fi
echo "Pre-deployment checks passed. Use the hosting platform's reviewed release mechanism."
echo "Rollback: redeploy the previous known-good application commit; handle destructive data migrations separately."
