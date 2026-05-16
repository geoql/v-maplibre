/**
 * Wraps a dynamic `import()` of an optional peer dependency and converts the
 * opaque bundler `Cannot find module '…'` error into an actionable message
 * that names the package and includes a copy-pasteable install command.
 *
 * Use this **only** in non-Vue-SFC contexts (composables, lazy data loaders,
 * controls that already use `await import()`). Inside `<script setup>` of a
 * Vue component, prefer the existing top-level `import` statements — Vue
 * templates render synchronously and turning component-level imports into
 * dynamic ones changes the component contract.
 *
 * @example
 * ```ts
 * const { LidarControl } = await requirePeer(
 *   'maplibre-gl-lidar',
 *   () => import('maplibre-gl-lidar'),
 * );
 * ```
 *
 * @example Custom install command (e.g. multi-package install)
 * ```ts
 * const mod = await requirePeer(
 *   '@developmentseed/deck.gl-geotiff',
 *   () => import('@developmentseed/deck.gl-geotiff'),
 *   'pnpm add @developmentseed/deck.gl-geotiff @developmentseed/deck.gl-raster @developmentseed/geotiff @developmentseed/proj',
 * );
 * ```
 *
 * @param packageName - The npm package name (used in the error message).
 * @param loader - A thunk returning `import('<packageName>')`. Must be a thunk
 *   so the bundler can split it and so the import is evaluated lazily.
 * @param installCommand - Optional override for the install hint. Defaults to
 *   `pnpm add <packageName>`. Pass a custom command when several peer packages
 *   must be installed together.
 * @returns The resolved module exports.
 * @throws Error with a descriptive message naming the package, the install
 *   command, and the underlying loader error.
 */
export async function requirePeer<T>(
  packageName: string,
  loader: () => Promise<T>,
  installCommand?: string,
): Promise<T> {
  try {
    return await loader();
  } catch (cause) {
    const install = installCommand ?? `pnpm add ${packageName}`;
    const reason = cause instanceof Error ? cause.message : String(cause);
    const error = new Error(
      `[@geoql/v-maplibre] Missing optional peer dependency "${packageName}". ` +
        `Install it with: ${install}\nOriginal error: ${reason}`,
    );
    if (cause instanceof Error && cause.stack) {
      error.stack = `${error.message}\nCaused by: ${cause.stack}`;
    }
    throw error;
  }
}
