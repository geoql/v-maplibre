import { describe, expect, it } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import SiteToolbar from '#shell/components/SiteToolbar.vue';

const passthrough = {
  render() {
    return this.$slots.default?.();
  },
};

const mountToolbar = (slots = {}) =>
  mount(SiteToolbar, {
    props: {
      links: [
        {
          label: 'Examples',
          to: 'https://mapcn-vue.geoql.in/examples',
          icon: 'lucide:map',
          external: true,
        },
        { label: 'Home', to: '/', icon: 'lucide:home' },
      ],
    },
    slots,
    global: {
      stubs: {
        Icon: true,
        ClientOnly: passthrough,
        NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
        Tooltip: passthrough,
        TooltipTrigger: passthrough,
        TooltipContent: true,
        ThemeToggle: true,
      },
    },
  });

describe('SiteToolbar', () => {
  it('renders one link per entry, labelled for screen readers', () => {
    const links = mountToolbar().findAll('[data-toolbar-link]');
    expect(links.map((l) => l.attributes('href'))).toEqual([
      'https://mapcn-vue.geoql.in/examples',
      '/',
    ]);
    expect(links[0]!.text()).toContain('Examples');
  });

  it('opens external links in a new tab without an opener', () => {
    const external = mountToolbar().findAll('[data-toolbar-link]')[0]!;
    expect(external.attributes('target')).toBe('_blank');
    expect(external.attributes('rel')).toBe('noopener noreferrer');
    const internal = mountToolbar().findAll('[data-toolbar-link]')[1]!;
    expect(internal.attributes('target')).toBeUndefined();
  });

  it('renders the start slot before the links and the default slot after', () => {
    const html = mountToolbar({
      start: () => h('button', { id: 'start' }),
      default: () => h('button', { id: 'end' }),
    }).html();
    const start = html.indexOf('id="start"');
    const link = html.indexOf('data-toolbar-link');
    const end = html.indexOf('id="end"');
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(link);
    expect(end).toBeGreaterThan(link);
  });
});
