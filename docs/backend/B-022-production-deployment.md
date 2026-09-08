# B-022 — Production Deployment Reliability, Index Deployment & Rollback

## Implemented

Added `scripts/deploy-production.sh` as a guarded production preflight. It refuses to continue unless:

- `DEPLOY_CONFIRM=YES` is explicitly supplied;
- deployment is from the configured release branch (default `main`);
- the working tree is clean;
- local HEAD matches `origin/main` (or `DEPLOY_BRANCH`);
- backend dependencies install successfully with `npm ci`;
- the backend builds successfully;
- the backend test suite passes.

If `FIREBASE_PROJECT_ID` is supplied, the script also deploys the checked-in Firestore indexes using the Firebase CLI.

## Release order

1. Merge reviewed code after CI passes.
2. Deploy application code using the hosting provider's reviewed release mechanism.
3. Deploy additive Firestore indexes before enabling code paths that depend on them.
4. Verify health/readiness and critical checkout/order flows.
5. Keep the previous application revision available for rapid rollback.

## Rollback strategy

Application rollback is performed by redeploying the previous known-good commit/revision. Database/index changes are treated separately: additive indexes are safe to retain during application rollback, while destructive schema/data migrations must be backward-compatible and never be automatically reversed as part of an application rollback.

## Safety

The script does not contain credentials, does not automatically deploy the application, and does not run destructive database operations. Firebase credentials/project configuration remain deployment-environment concerns.

**B-022 complete.**
