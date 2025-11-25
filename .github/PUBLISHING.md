# Publishing Guide

This document explains how to publish `@geoql/v-maplibre` to npm and JSR using GitHub Actions.

## Prerequisites

Before you can publish, you need to set up the following:

### 1. NPM Trusted Publisher (Provenance)

This package uses **npm Trusted Publishers** for secure, token-less publishing with provenance attestation.

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Navigate to your package (or create it first with `npm publish` locally)
3. Go to package **Settings** → **Publishing access**
4. Scroll to **Trusted publishers** section
5. Click **Add trusted publisher**
6. Fill in the details:
   - **Provider**: GitHub Actions
   - **Repository owner**: `geoql` (or your GitHub org/username)
   - **Repository name**: `v-maplibre`
   - **Workflow**: `release.yml`
   - **Environment**: Leave empty (not using environments)
7. Click **Add**

This allows the GitHub Actions workflow to publish without needing an NPM_TOKEN! The workflow uses GitHub's OIDC token to authenticate.

### 2. GPG Key for Signed Commits (Required)

GitHub repository rules require verified commit signatures. You need to create a GPG key for the release workflow:

**Generate GPG Key:**

```bash
# Generate a new GPG key
gpg --full-generate-key
# Choose: RSA and RSA, 4096 bits, no expiration
# Name: github-actions[bot]
# Email: github-actions[bot]@users.noreply.github.com

# Export the private key (copy the output)
gpg --armor --export-secret-keys YOUR_KEY_ID

# If you set a passphrase, you'll need it for the secret
```

**Add to GitHub Secrets:**

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:
   - **`GPG_PRIVATE_KEY`**: Paste the entire GPG private key (including `-----BEGIN PGP PRIVATE KEY BLOCK-----` and `-----END PGP PRIVATE KEY BLOCK-----`)
   - **`GPG_PASSPHRASE`**: Your GPG key passphrase (if you set one)

### 3. Personal Access Token (PAT) for Branch Protection Bypass

If you have branch protection rules (required status checks), you need a PAT to bypass them:

**Create PAT:**

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Give it a name (e.g., "v-maplibre Release Bot")
4. Set repository access to **Only select repositories** → Choose `v-maplibre`
5. Set permissions:
   - **Contents**: Read and write
   - **Metadata**: Read-only (automatically selected)
6. Generate token and copy it

**Add to GitHub Secrets:**

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secret:
   - **`PAT_TOKEN`**: Paste your personal access token

### 4. JSR Token

1. Go to [jsr.io](https://jsr.io/) and log in with GitHub
2. Click on your profile → **Settings** → **Access Tokens**
3. Click **Create Token**
4. Give it a name (e.g., "GitHub Actions - v-maplibre")
5. Select scope: **Publish packages**
6. Copy the token

Add it to GitHub:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `JSR_TOKEN`
4. Value: Paste your JSR token
5. Click **Add secret**

## Publishing Process

### Automated Publishing via GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **Release** workflow in the left sidebar
4. Click **Run workflow** button (top right)
5. Select the release type:
   - **patch**: Bug fixes (1.0.0 → 1.0.1)
   - **minor**: New features (1.0.0 → 1.1.0)
   - **major**: Breaking changes (1.0.0 → 2.0.0)
   - **prepatch**: Pre-release patch (1.0.0 → 1.0.1-0)
   - **preminor**: Pre-release minor (1.0.0 → 1.1.0-0)
   - **premajor**: Pre-release major (1.0.0 → 2.0.0-0)
6. Click **Run workflow**

### What Happens During Release

The workflow will:

1. ✅ Checkout the repository
2. ✅ Set up Node.js (LTS version)
3. ✅ Set up pnpm (version from `packageManager` field)
4. ✅ Install dependencies
5. ✅ Configure git user as `github-actions[bot]`
6. ✅ Run `release-it` which will:
   - Run pre-release checks (lint, format, tests)
   - Bump version in `package.json`
   - Sync version to `jsr.json` (via `scripts/sync-version.js`)
   - Run build (`pnpm build`)
   - Generate CHANGELOG.md
   - Create a git commit
   - Create a git tag
   - Push to GitHub
   - Create GitHub Release
7. ✅ Publish to npm with **provenance attestation** (using GitHub OIDC, no token needed!)
8. ✅ Publish to JSR

### Verification

After the workflow completes:

1. **Check npm**: Visit `https://www.npmjs.com/package/@geoql/v-maplibre`
   - You should see a ✅ **Provenance** badge on the package page
   - Click on it to see the build attestation linking to the GitHub Actions run
2. **Check JSR**: Visit `https://jsr.io/@geoql/v-maplibre`
3. **Check GitHub Release**: Go to your repository → **Releases**
4. **Check CHANGELOG**: View the updated `CHANGELOG.md` in your repository

### What is Provenance?

The provenance attestation provides cryptographic proof that:

- The package was built by GitHub Actions (not a compromised developer machine)
- The package came from your specific repository and workflow
- The package binary matches the source code in your repository

Users can verify this with:

```bash
npm audit signatures
```

This significantly improves supply chain security!

## Local Publishing (Not Recommended)

If you need to publish locally (not recommended - use GitHub Actions instead):

```bash
# Make sure you're on main branch and it's up to date
git checkout main
git pull

# Run release-it interactively
pnpm release

# Publish to JSR manually (if needed)
npx jsr publish
```

## Troubleshooting

### NPM Publish Fails

- **First time publishing?** You need to do an initial `npm publish` locally to create the package, then set up the trusted publisher
- Verify the trusted publisher is configured correctly on npmjs.com
- Check that the workflow has `id-token: write` permission (it does!)
- Ensure package version doesn't already exist on npm
- Check that you have publish access to the `@geoql` scope (or create it first)

### JSR Publish Fails

- Verify `JSR_TOKEN` secret is set correctly
- Check that `jsr.json` is properly formatted
- Ensure version in `jsr.json` matches `package.json`

### Version Mismatch

If `jsr.json` version doesn't match `package.json`:

```bash
# Run the sync script manually
node scripts/sync-version.js
```

### Build Fails

Check that all pre-publish checks pass:

```bash
# Run locally to debug
pnpm run lint
pnpm run format:check
pnpm run test:coverage
pnpm run build
```

## Release Workflow Details

The release workflow (`.github/workflows/release.yml`) is triggered manually via `workflow_dispatch`. It requires:

- **Permissions**:
  - `contents: write` - To push commits and tags
  - `id-token: write` - For npm provenance

- **Secrets Required**:
  - `GITHUB_TOKEN` - Automatically provided by GitHub
  - `NPM_TOKEN` - For npm publishing
  - `JSR_TOKEN` - For JSR publishing

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation. Use these commit types:

- `feat`: New feature (triggers minor version bump)
- `fix`: Bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `ci`: CI/CD changes

Breaking changes should include `BREAKING CHANGE:` in the commit footer (triggers major version bump).

Example:

```
feat: add new marker clustering feature

Adds automatic marker clustering for better performance
with large datasets.

BREAKING CHANGE: The `markers` prop now requires unique IDs
```

## Pre-releases

For beta/alpha releases:

1. Use `prepatch`, `preminor`, or `premajor` release type
2. This creates versions like `1.0.0-0`, `1.1.0-0`, etc.
3. Publish to npm with `next` tag:
   ```bash
   npm publish --tag next
   ```

To install a pre-release:

```bash
npm install @geoql/v-maplibre@next
```

## Support

If you encounter issues with publishing:

1. Check the [GitHub Actions logs](../../actions)
2. Verify all secrets are set correctly
3. Review the [release-it documentation](https://github.com/release-it/release-it)
4. Check [JSR documentation](https://jsr.io/docs/publishing-packages)
