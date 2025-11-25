# Release Setup Checklist

Before you can successfully release via GitHub Actions, complete these setup steps:

## ✅ Required Secrets

Add these secrets in **GitHub Repository Settings** → **Secrets and variables** → **Actions**:

### 1. `GPG_PRIVATE_KEY` (Required for signed commits)

```bash
# Generate GPG key
gpg --full-generate-key
# Choose: RSA and RSA, 4096 bits, no expiration
# Name: github-actions[bot]
# Email: github-actions[bot]@users.noreply.github.com

# List keys to get the KEY_ID
gpg --list-secret-keys --keyid-format=long

# Export private key
gpg --armor --export-secret-keys YOUR_KEY_ID
```

Copy the entire output (including headers) and add as `GPG_PRIVATE_KEY` secret.

### 2. `GPG_PASSPHRASE` (Required if you set a passphrase)

Add the passphrase you used when creating the GPG key. If you didn't set one, you can skip this.

### 3. `PAT_TOKEN` (Required to bypass branch protection)

1. Go to **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. **Generate new token**:
   - Name: `v-maplibre Release Bot`
   - Repository access: **Only select repositories** → `v-maplibre`
   - Permissions:
     - **Contents**: Read and write
     - **Metadata**: Read-only (auto-selected)
3. Copy token and add as `PAT_TOKEN` secret

### 4. `JSR_TOKEN` (Required for JSR publishing)

1. Go to [jsr.io](https://jsr.io/) and log in with GitHub
2. **Settings** → **Access Tokens** → **Create Token**
3. Name: `GitHub Actions - v-maplibre`
4. Scope: **Publish packages**
5. Copy token and add as `JSR_TOKEN` secret

## ✅ npm Trusted Publisher Setup

1. First, publish v1.0.0 manually (one-time only):

   ```bash
   pnpm build
   npm login
   npm publish --access public
   ```

2. Configure Trusted Publisher on npmjs.com:
   - Go to package **Settings** → **Publishing access**
   - **Add trusted publisher**:
     - Provider: GitHub Actions
     - Repository: `geoql/v-maplibre`
     - Workflow: `release.yml`
     - Environment: (leave empty)

## ✅ Summary

Once all 4 secrets are added and npm trusted publisher is configured:

1. ✅ `GPG_PRIVATE_KEY` - For signed commits
2. ✅ `GPG_PASSPHRASE` - For GPG key passphrase (if set)
3. ✅ `PAT_TOKEN` - To bypass branch protection
4. ✅ `JSR_TOKEN` - To publish to JSR
5. ✅ npm Trusted Publisher configured

You can then trigger releases via:

- **GitHub Actions** → **Release** workflow → **Run workflow**
- Select release type (patch/minor/major)

## 🎉 What Happens During Release

1. Runs lint, format check, and tests
2. Bumps version in `package.json` and `jsr.json`
3. Generates `CHANGELOG.md` from conventional commits
4. Creates signed commit and tag
5. Pushes to GitHub (bypassing branch protection with PAT)
6. Creates GitHub Release
7. Publishes to npm with provenance (using trusted publisher)
8. Publishes to JSR

All automated! 🚀
