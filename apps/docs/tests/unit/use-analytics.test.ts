import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { useAnalytics } from '../../app/composables/use-analytics';
import {
  componentPage,
  installCommand,
  outboundTarget,
} from '../../app/utils/analytics-funnel';

function stubNuxtApp(handles: Record<string, unknown>) {
  vi.stubGlobal('useNuxtApp', () => handles);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAnalytics', () => {
  it('sends one track() call to GA4, Plausible and OpenPanel', () => {
    const gtag = vi.fn();
    const plausible = vi.fn();
    const openpanelTrack = vi.fn();
    stubNuxtApp({
      $ga: { gtag },
      $plausible: { plausible },
      $openpanel: { track: openpanelTrack },
    });

    const props = {
      packageManager: 'pnpm',
      packages: '@geoql/v-maplibre maplibre-gl',
      page: '/guide/getting-started',
    } as const;
    useAnalytics().track('install_command_copied', props);

    expect(gtag).toHaveBeenCalledExactlyOnceWith(
      'event',
      'install_command_copied',
      props,
    );
    expect(plausible).toHaveBeenCalledExactlyOnceWith(
      'install_command_copied',
      { props },
    );
    expect(openpanelTrack).toHaveBeenCalledExactlyOnceWith(
      'install_command_copied',
      props,
    );
  });

  it('skips trackers that are off', () => {
    const plausible = vi.fn();
    stubNuxtApp({ $ga: null, $plausible: { plausible }, $openpanel: null });

    useAnalytics().track('component_viewed', {
      section: 'components',
      slug: 'map',
    });

    expect(plausible).toHaveBeenCalledExactlyOnceWith('component_viewed', {
      props: { section: 'components', slug: 'map' },
    });
  });
});

describe('analytics funnel helpers', () => {
  it('classifies GitHub and npm links', () => {
    expect(outboundTarget('https://github.com/geoql/v-maplibre')).toBe(
      'github',
    );
    expect(
      outboundTarget('https://www.npmjs.com/package/@geoql/v-maplibre'),
    ).toBe('npm');
    expect(outboundTarget('https://v-maplibre.geoql.in/')).toBeNull();
  });

  it('maps component docs paths to section + slug', () => {
    expect(componentPage('/components/map')).toEqual({
      section: 'components',
      slug: 'map',
    });
    expect(componentPage('/layers/core-layers/')).toEqual({
      section: 'layers',
      slug: 'core-layers',
    });
    expect(componentPage('/layers')).toBeNull();
    expect(componentPage('/guide/getting-started')).toBeNull();
  });

  it('recognises install commands and nothing else', () => {
    expect(installCommand('pnpm add @geoql/v-maplibre maplibre-gl\n')).toEqual(
      { packageManager: 'pnpm', packages: '@geoql/v-maplibre maplibre-gl' },
    );
    expect(installCommand('npm install -D maplibre-gl-lidar')).toEqual({
      packageManager: 'npm',
      packages: 'maplibre-gl-lidar',
    });
    expect(installCommand('bun add three')).toEqual({
      packageManager: 'bun',
      packages: 'three',
    });
    expect(installCommand('<VMap :options="opts" />')).toBeNull();
  });
});
