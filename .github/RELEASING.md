# Release Guide

This project uses [Release Please](https://github.com/googleapis/release-please) for automated releases based on [Conventional Commits](https://www.conventionalcommits.org/).

## How It Works

1. **Commits to `main`** with conventional commit messages (`feat:`, `fix:`, etc.) trigger Release Please
2. **Release Please creates/updates a Release PR** with version bumps and changelog
3. **Merging the Release PR** creates a GitHub Release and triggers publishing to npm and JSR

## Prerequisites

Before releasing, ensure you have:

1. **RELEASE_PAT** secret configured in GitHub (Personal Access Token for Release Please)
2. **npm Trusted Publisher** configured (for token-less npm publishing)
3. **JSR linked repo** configured (for token-less JSR publishing)
4. Push access to the `main` branch
5. All CI checks passing

### Setting up RELEASE_PAT

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create a new token with:
   - Repository access: This repository only
   - Permissions: Contents (read/write), Pull requests (read/write)
3. Add the token as `RELEASE_PAT` in GitHub repository secrets

### Setting up NPM Trusted Publisher

This package uses **npm Trusted Publishers** for secure, token-less publishing with provenance attestation.

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Navigate to your package → **Settings** → **Publishing access**
3. Scroll to **Trusted publishers** → Click **Add trusted publisher**
4. Fill in:
   - **Provider**: GitHub Actions
   - **Repository owner**: `geoql`
   - **Repository name**: `v-maplibre`
   - **Workflow**: `release-please.yml`
   - **Environment**: Leave empty
5. Click **Add**

### Setting up JSR Linked Repository

JSR uses GitHub OIDC for token-less publishing when the repo is linked.

1. Go to [jsr.io](https://jsr.io) and sign in
2. Navigate to your package → **Settings** → **Linked GitHub repository**
3. Link the `geoql/v-maplibre` repository

## Release Process

### Automatic (Recommended)

1. Make commits to `main` following [Conventional Commits](#commit-convention)
2. Release Please automatically creates/updates a Release PR
3. Review the Release PR (check version bump, changelog)
4. Merge the Release PR
5. Publishing to npm and JSR happens automatically

### What Happens on Merge

When you merge a Release Please PR:

- Version is bumped in `package.json` and `jsr.json`
- `CHANGELOG.md` is updated
- Git tag is created (e.g., `v1.3.0`)
- GitHub Release is created
- Package is published to npm with provenance
- Package is published to JSR

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Types

| Type        | Description              | Version Bump          |
| ----------- | ------------------------ | --------------------- |
| `feat:`     | New feature              | Minor (0.1.0 → 0.2.0) |
| `fix:`      | Bug fix                  | Patch (0.1.0 → 0.1.1) |
| `docs:`     | Documentation changes    | -                     |
| `style:`    | Code style changes       | -                     |
| `refactor:` | Code refactoring         | -                     |
| `perf:`     | Performance improvements | Patch                 |
| `test:`     | Adding or updating tests | -                     |
| `chore:`    | Maintenance tasks        | -                     |
| `ci:`       | CI/CD changes            | -                     |
| `build:`    | Build system changes     | -                     |

### Breaking Changes

Add `BREAKING CHANGE:` in the commit body or use `!` after the type to trigger a major release:

```bash
git commit -m "feat!: redesign API structure

BREAKING CHANGE: API endpoints have been restructured"
```

### Examples

```bash
# Patch release (0.1.0 → 0.1.1)
git commit -m "fix: resolve marker positioning bug"

# Minor release (0.1.0 → 0.2.0)
git commit -m "feat: add cluster layer support"

# Major release (0.1.0 → 1.0.0)
git commit -m "feat!: redesign component API

BREAKING CHANGE: props have been renamed"
```

## Configuration Files

- **`release-please-config.json`** - Release Please configuration
- **`.release-please-manifest.json`** - Current version tracking

## Troubleshooting

### Release PR not created

Check that:

1. Commits follow conventional commit format
2. `RELEASE_PAT` secret is configured
3. Workflow has proper permissions

### npm publish fails

Check that:

1. `NPM_TOKEN` secret is set in GitHub
2. Token has publish permissions
3. Package name is available on npm

### Version not bumped correctly

Review your commit messages - only `feat:` and `fix:` (and `perf:`) commits trigger version bumps.

## CI/CD Workflows

### Release Please Workflow (`.github/workflows/release-please.yml`)

Runs on every push to `main`:

- Creates/updates Release PR based on commits
- On Release PR merge: publishes to npm and JSR

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR:

- Linting (Oxlint)
- Formatting check (Prettier)
- Tests with coverage
- Build verification
- Documentation build

### Commit Lint Workflow (`.github/workflows/commitlint.yml`)

Runs on PRs - ensures all commits follow conventional commits.

## Deployment Workflows

### Docs (`apps/docs`)

- **Trigger**: Push to `main` with changes in `apps/docs/**` or `packages/v-maplibre/**`
- **Destination**: https://v-maplibre.geoql.in
- **Workflow**: `.github/workflows/deploy-docs.yml`
- **Platform**: Cloudflare Pages

### mapcn-vue (`apps/mapcn-vue`)

- **Trigger**: Push to `main` with changes in `apps/mapcn-vue/**` or `packages/**`
- **Destination**: https://mapcn-vue.geoql.in
- **Workflow**: `.github/workflows/deploy-mapcn.yml`
- **Platform**: Cloudflare Pages

## Version Lifecycle

```
0.1.0 (current)
  ↓ feat: new feature
0.2.0
  ↓ fix: bug fix
0.2.1
  ↓ feat!: breaking change
1.0.0
```
