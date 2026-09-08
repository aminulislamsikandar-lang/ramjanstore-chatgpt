# B-021 — CI/CD, Automated Tests & Deployment Gates

## Implemented

Added `.github/workflows/backend-ci.yml`.

The backend CI workflow runs on pushes to `main` and pull requests that touch the backend or workflow. It:

1. checks out the repository;
2. installs Node 20;
3. runs `npm ci` using the backend lockfile;
4. runs the TypeScript production build;
5. runs the Vitest suite.

The workflow has read-only repository permissions and cancels superseded runs for the same ref.

## Deployment gate

A deployment process should consume this workflow's successful status before deploying backend changes. No production deployment is triggered directly by this workflow, avoiding accidental releases from unreviewed commits and avoiding a requirement for deployment credentials in CI.

For GitHub branch protection, mark **Backend verify** as a required status check on `main` once branch protection/rulesets are configured for the repository.

## Current limitation

This repository's available GitHub integration can create the workflow but cannot safely configure repository branch-protection settings or deployment secrets. Those are repository-owner settings and should be enabled in GitHub after confirming the workflow is green.

**B-021 CI foundation complete.**
