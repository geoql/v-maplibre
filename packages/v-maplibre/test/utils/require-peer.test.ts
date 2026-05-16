import { describe, it, expect } from 'vitest';
import { requirePeer } from '../../src/utils/require-peer';

describe('requirePeer', () => {
  it('resolves with the module when the loader succeeds', async () => {
    const mod = { LidarControl: class {} };
    const result = await requirePeer('maplibre-gl-lidar', () =>
      Promise.resolve(mod),
    );
    expect(result).toBe(mod);
  });

  it('throws an actionable error that names the package', async () => {
    const original = new Error("Cannot find module 'maplibre-gl-lidar'");
    await expect(
      requirePeer('maplibre-gl-lidar', () => Promise.reject(original)),
    ).rejects.toThrow(/Missing optional peer dependency "maplibre-gl-lidar"/);
  });

  it('includes the default install command in the error', async () => {
    await expect(
      requirePeer('maplibre-gl-lidar', () =>
        Promise.reject(new Error('not found')),
      ),
    ).rejects.toThrow(/pnpm add maplibre-gl-lidar/);
  });

  it('uses a custom install command when provided', async () => {
    const customCmd =
      'pnpm add @developmentseed/deck.gl-geotiff @developmentseed/proj';
    await expect(
      requirePeer(
        '@developmentseed/deck.gl-geotiff',
        () => Promise.reject(new Error('not found')),
        customCmd,
      ),
    ).rejects.toThrow(new RegExp(customCmd.replace(/\//g, '\\/')));
  });

  it('preserves the underlying error message in the thrown error', async () => {
    await expect(
      requirePeer('foo-pkg', () => Promise.reject(new Error('boom inside'))),
    ).rejects.toThrow(/boom inside/);
  });

  it('handles non-Error rejections by coercing to string', async () => {
    await expect(
      // eslint-disable-next-line prefer-promise-reject-errors
      requirePeer('foo-pkg', () => Promise.reject('string failure')),
    ).rejects.toThrow(/string failure/);
  });
});
