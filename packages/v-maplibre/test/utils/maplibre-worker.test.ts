import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockWorkerUrl } from '../setup';

/**
 * MapLibre GL v6 builds its worker URL at runtime (`new URL(`./${t}`, base)`),
 * which bundlers cannot see — the request 404s (geoql/v-maplibre#160). `VMap`
 * installs a static `new URL(..., import.meta.url)` reference to the
 * self-contained worker shipped in `dist/maplibre-worker.js` instead.
 */
describe('installMaplibreWorkerUrl', () => {
  beforeEach(() => {
    mockWorkerUrl.value = '';
    vi.resetModules();
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
