# Release Guide

This project uses automated releases with semantic versioning via `release-it`.

## Prerequisites

Before releasing, ensure you have:

1. **NPM_TOKEN** secret configured in GitHub (for automated npm publishing)
2. **JSR_TOKEN** secret configured in GitHub (for automated JSR publishing)
3. Push access to the `main` branch
4. All CI checks passing

### Setting up JSR Token

1. Go to [jsr.io](https://jsr.io) and sign in
2. Create a new token at https://jsr.io/account/tokens
3. Add the token as `JSR_TOKEN` in GitHub repository secrets

## Release Process

### Manual Release (Recommended)

Use GitHub Actions workflow dispatch:

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Select the release type:
   - `patch` - Bug fixes (0.1.0 → 0.1.1)
   - `minor` - New features (0.1.0 → 0.2.0)
   - `major` - Breaking changes (0.1.0 → 1.0.0)
   - `prepatch` - Pre-release patch (0.1.0 → 0.1.1-0)
   - `preminor` - Pre-release minor (0.1.0 → 0.2.0-0)
   - `premajor` - Pre-release major (0.1.0 → 1.0.0-0)
4. Click **Run workflow**

The workflow will:

- ✅ Run linting
- ✅ Run tests with coverage
- ✅ Build the package
- ✅ Bump version in package.json
- ✅ Sync version to jsr.json
- ✅ Generate CHANGELOG.md
- ✅ Create git tag
- ✅ Push to GitHub
- ✅ Create GitHub release
- ✅ Publish to npm
- ✅ Publish to JSR

### Local Release (Advanced)

```bash
# Make sure you're on main and up to date
git checkout main
git pull

# Ensure you're logged in to npm
npm login

# Run release
pnpm release [patch|minor|major]

# Or for interactive mode
pnpm release
```

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Types

- `feat:` - New feature (triggers minor release)
- `fix:` - Bug fix (triggers patch release)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

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

## Pre-release Workflow

For pre-releases (alpha, beta, rc):

```bash
# Create a pre-release
pnpm release prepatch --preRelease=alpha
# Results in: 0.1.0 → 0.1.1-alpha.0

# Continue the pre-release
pnpm release prerelease --preRelease=alpha
# Results in: 0.1.1-alpha.0 → 0.1.1-alpha.1

# Graduate to stable
pnpm release patch
# Results in: 0.1.1-alpha.1 → 0.1.1
```

## Troubleshooting

### Release fails during npm publish

Check that:

1. `NPM_TOKEN` secret is set in GitHub
2. Token has publish permissions
3. Package name is available on npm

### Git push fails

Ensure you have push permissions to the repository.

### Tests fail during release

Fix the failing tests before attempting another release:

```bash
pnpm test
pnpm lint
pnpm format:check
```

## CI/CD Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR:

- Linting (Oxlint)
- Formatting check (Prettier)
- Tests with coverage
- Build verification
- Documentation build

### Release Workflow (`.github/workflows/release.yml`)

Manual trigger only - handles the complete release process.

### Commit Lint Workflow (`.github/workflows/commitlint.yml`)

Runs on PRs - ensures all commits follow conventional commits.

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
