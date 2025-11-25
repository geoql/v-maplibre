# Contributing to @geoql/v-maplibre

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js (LTS version)
- pnpm 9+
- Git

### Getting Started

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/v-maplibre.git
cd v-maplibre
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up git hooks**

```bash
pnpm prepare
```

This installs Husky hooks for:

- Pre-commit: Runs lint-staged (Oxlint + Prettier on staged files)
- Commit-msg: Validates commit messages against conventional commits

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

### Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test run

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Linting and Formatting

```bash
# Run Oxlint
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Building

```bash
pnpm build
```

### Documentation

```bash
# Start docs dev server
pnpm docs:dev

# Build docs
pnpm docs:build

# Preview docs build
pnpm docs:preview
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commits must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

### Examples

```bash
feat(map): add cluster layer support

fix(marker): resolve positioning bug on zoom

docs(readme): update installation instructions

test(layers): add geojson layer tests
```

### Breaking Changes

Use `!` after the type or add `BREAKING CHANGE:` in the footer:

```bash
feat(api)!: redesign component props

BREAKING CHANGE: VMap props have been renamed for consistency
```

## Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feat/my-new-feature
# or
git checkout -b fix/bug-description
```

2. **Make your changes**

- Write tests for new features
- Update documentation
- Follow the existing code style
- Ensure all tests pass
- Maintain or improve test coverage (90%+ required)

3. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature"
```

The pre-commit hook will:

- Run Oxlint on staged files
- Format staged files with Prettier

The commit-msg hook will:

- Validate your commit message format

4. **Push to your fork**

```bash
git push origin feat/my-new-feature
```

5. **Create a Pull Request**

- Use a clear, descriptive title
- Describe what changes you made and why
- Link any related issues
- Ensure all CI checks pass

### Pull Request Checklist

- [ ] Tests pass locally (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Test coverage is maintained (90%+)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with main

## Code Structure

```
v-maplibre/
├── src/                    # Source code
│   ├── constants/         # Event constants
│   ├── controls/          # Map controls
│   ├── layers/            # Layer components
│   ├── map/               # Core map component
│   ├── markers/           # Marker components
│   ├── popups/            # Popup components
│   └── utils/             # Utilities
├── test/                  # Test files
├── docs/                  # Documentation (Docus)
└── .github/               # GitHub workflows
```

## Testing Guidelines

- Write tests for all new features
- Maintain 90%+ code coverage
- Use descriptive test names
- Mock external dependencies (MapLibre GL, PMTiles)
- Test both happy paths and edge cases

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VMap from '@/map/VMap.vue';

describe('VMap', () => {
  it('renders with default options', () => {
    const wrapper = mount(VMap, {
      props: {
        options: {
          container: 'map',
          style: 'https://example.com/style.json',
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
```

## Documentation Guidelines

- Update relevant documentation when adding features
- Use clear, concise language
- Include code examples
- Follow the existing documentation structure

## Questions?

Feel free to:

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
