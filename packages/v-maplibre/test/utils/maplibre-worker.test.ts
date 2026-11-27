import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { mockMaplibreVersion, mockWorkerUrl } from '../setup';

/**
 * MapLibre GL v6 builds its worker URL at runtime (`new URL(`./${t}`, base)`),
 * which bundlers cannot see — the request 404s (geoql/v-maplibre#160). `VMap`
 * installs a static `new URL(..., import.meta.url)` reference to the
 * self-contained worker shipped in `dist/maplibre-worker.js` instead.
 */
describe('installMaplibreWorkerUrl', () => {
  beforeEach(() => {
    mockWorkerUrl.value = '';
    mockMaplibreVersion.value = __MAPLIBRE_WORKER_VERSION__;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('points MapLibre at the bundled worker next to the library entry', async () => {
    const { installMaplibreWorkerUrl } =
      await import('../../src/utils/maplibre-worker-url');

    installMaplibreWorkerUrl();

    expect(mockWorkerUrl.value).toMatch(/maplibre-worker\.js$/);
  });

  it('keeps a worker URL the consumer already set', async () => {
    mockWorkerUrl.value = 'https://cdn.example.com/custom-worker.mjs';
    const { installMaplibreWorkerUrl } =
      await import('../../src/utils/maplibre-worker-url');

    installMaplibreWorkerUrl();

    expect(mockWorkerUrl.value).toBe(
      'https://cdn.example.com/custom-worker.mjs',
    );
  });

  it('installs only once', async () => {
    const { installMaplibreWorkerUrl } =
      await import('../../src/utils/maplibre-worker-url');

    installMaplibreWorkerUrl();
    const installed = mockWorkerUrl.value;
    expect(installed).toMatch(/maplibre-worker\.js$/);

    mockWorkerUrl.value = '';
    installMaplibreWorkerUrl();

    expect(mockWorkerUrl.value).toBe('');
  });
});

/**
 * `maplibre-gl` 6.20.0 changed the `PlacedSymbol` struct array
 * (`glyphStartIndex` Uint16 → Uint32). A 6.19.0 worker next to a 6.20.0 main
 * thread (or the reverse) throws `Length of new data is N, which doesn't match
 * current length of M` from `updateVariableAnchors`, and the map never loads.
 * The bundled worker is only installed when both sides are the same build.
 */
describe('installMaplibreWorkerUrl version guard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockWorkerUrl.value = '';
    mockMaplibreVersion.value = __MAPLIBRE_WORKER_VERSION__;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it.each([
    ['a newer main thread than the worker', '6.20.0', '6.19.0'],
    ['an older main thread than the worker', '6.19.0', '6.20.0'],
  ])(
    'skips the bundled worker and warns once for %s',
    async (_label, mainVersion, workerVersion) => {
      vi.stubGlobal('__MAPLIBRE_WORKER_VERSION__', workerVersion);
      mockMaplibreVersion.value = mainVersion;
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { installMaplibreWorkerUrl } =
        await import('../../src/utils/maplibre-worker-url');

      installMaplibreWorkerUrl();
      installMaplibreWorkerUrl();

      expect(mockWorkerUrl.value).toBe('');
      expect(warn).toHaveBeenCalledTimes(1);
      const message = String(warn.mock.calls[0]?.[0]);
      expect(message).toContain(`maplibre-gl ${workerVersion}`);
      expect(message).toContain(`maplibre-gl ${mainVersion}`);
      expect(message).toContain('setWorkerUrl');
    },
  );

  it('installs the bundled worker without a warning when the versions match', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { installMaplibreWorkerUrl } =
      await import('../../src/utils/maplibre-worker-url');

    installMaplibreWorkerUrl();

    expect(mockWorkerUrl.value).toMatch(/maplibre-worker\.js$/);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn when the consumer set a worker URL for another version', async () => {
    mockMaplibreVersion.value = '6.20.0';
    mockWorkerUrl.value = 'https://cdn.example.com/custom-worker.mjs';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { installMaplibreWorkerUrl } =
      await import('../../src/utils/maplibre-worker-url');

    installMaplibreWorkerUrl();

    expect(mockWorkerUrl.value).toBe(
      'https://cdn.example.com/custom-worker.mjs',
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

/**
 * Reads the files MapLibre ships, with no mock and no shared constant: the
 * expected values come from three independent places on disk.
 */
describe('bundled worker version matches the installed maplibre-gl', () => {
  const pkgJsonPath = createRequire(import.meta.url).resolve(
    'maplibre-gl/package.json',
  );
  const licenseVersion = (file: string): string | undefined =>
    /blob\/v([^/\s]+)\/LICENSE/.exec(
      readFileSync(join(dirname(pkgJsonPath), 'dist', file), 'utf8'),
    )?.[1];

  const readOwnPackageJson = () =>
    JSON.parse(
      readFileSync(join(import.meta.dirname, '../../package.json'), 'utf8'),
    );

  it('has an exact maplibre-gl dependency, not a range', () => {
    const ownPkg = readOwnPackageJson();
    expect(ownPkg.dependencies['maplibre-gl']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('builds the worker from the version the package.json pins', () => {
    const ownPkg = readOwnPackageJson();
    expect(licenseVersion('maplibre-gl-worker.mjs')).toBe(
      ownPkg.dependencies['maplibre-gl'],
    );
  });

  it('has a main thread and a worker of the same version', () => {
    expect(licenseVersion('maplibre-gl.mjs')).toBe(
      licenseVersion('maplibre-gl-worker.mjs'),
    );
  });

  it('injects that version into the runtime guard', () => {
    expect(__MAPLIBRE_WORKER_VERSION__).toBe(
      licenseVersion('maplibre-gl-worker.mjs'),
    );
  });

  it('reports the same version from the real getVersion()', async () => {
    const actual =
      await vi.importActual<typeof import('maplibre-gl')>('maplibre-gl');
    expect(actual.getVersion()).toBe(licenseVersion('maplibre-gl.mjs'));
  });
});
