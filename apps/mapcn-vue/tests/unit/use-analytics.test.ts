import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { useAnalytics } from '../../app/composables/use-analytics';
import { outboundTarget, slugAfter } from '../../app/utils/analytics-funnel';

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
      location: 'hero',
      registry: 'map',
      packageManager: 'npm',
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
    const openpanelTrack = vi.fn();
    stubNuxtApp({
      $ga: null,
      $plausible: null,
      $openpanel: { track: openpanelTrack },
    });

    useAnalytics().track('example_viewed', { slug: 'basic' });

    expect(openpanelTrack).toHaveBeenCalledExactlyOnceWith('example_viewed', {
      slug: 'basic',
    });
  });

  it('reads handles at call time, so early callers still reach late plugins', () => {
    const handles: Record<string, unknown> = {};
    stubNuxtApp(handles);
    const { track } = useAnalytics();

    const gtag = vi.fn();
    handles.$ga = { gtag };
    track('docs_page_viewed', { slug: 'introduction' });

    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'docs_page_viewed', {
      slug: 'introduction',
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
    expect(outboundTarget('https://mapcn-vue.geoql.in/docs')).toBeNull();
    expect(outboundTarget('not a url')).toBeNull();
  });

  it('extracts slugs under a prefix', () => {
    expect(slugAfter('/examples/basic', '/examples/')).toBe('basic');
    expect(slugAfter('/examples/', '/examples/')).toBeNull();
    expect(slugAfter('/docs/introduction/', '/docs/')).toBe('introduction');
    expect(slugAfter('/faq', '/docs/')).toBeNull();
  });
});
