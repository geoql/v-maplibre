import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import Alert from '#shell/components/content/Alert.vue';
import Callout from '#shell/components/content/Callout.vue';
import CodeGroup from '#shell/components/content/CodeGroup.vue';
import ProsePre from '#shell/components/content/ProsePre.vue';

const stubs = {
  Icon: { props: ['name'], template: '<i :data-icon="name" />' },
  NuxtLink: {
    props: ['to', 'target'],
    template: '<a :href="to" :target="target"><slot /></a>',
  },
};

describe('Alert', () => {
  it.each([
    ['info', 'text-primary'],
    ['success', 'text-success'],
    ['warning', 'text-warning'],
    ['danger', 'text-destructive'],
  ])('maps type %s to the %s token', (type, token) => {
    const html = mount(Alert, {
      props: { type },
      slots: { default: 'Body' },
      global: { stubs },
    }).html();
    expect(html).toContain(token);
    expect(html).toContain('Body');
  });

  it('defaults to info', () => {
    expect(
      mount(Alert, { slots: { default: 'x' }, global: { stubs } }).html(),
    ).toContain('text-primary');
  });
});

describe('Callout', () => {
  it('renders a link with the given target when `to` is set', () => {
    const a = mount(Callout, {
      props: { to: 'https://e.x', target: '_blank', icon: 'i-lucide-info' },
      slots: { default: 'Go' },
      global: { stubs },
    }).find('a');
    expect(a.attributes('href')).toBe('https://e.x');
    expect(a.attributes('target')).toBe('_blank');
  });

  it('renders the Docus-style icon name as an iconify name', () => {
    const icon = mount(Callout, {
      props: { icon: 'i-lucide-book' },
      slots: { default: 'x' },
      global: { stubs },
    }).find('[data-icon]');
    expect(icon.attributes('data-icon')).toBe('lucide:book');
  });

  it('maps the Docus colour to a token', () => {
    const icon = mount(Callout, {
      props: { color: 'success' },
      slots: { default: 'x' },
      global: { stubs },
    }).find('[data-icon]');
    expect(icon.classes()).toContain('text-success');
  });

  it('renders no link without `to`', () => {
    expect(
      mount(Callout, { slots: { default: 'x' }, global: { stubs } })
        .find('a')
        .exists(),
    ).toBe(false);
  });
});

describe('CodeGroup', () => {
  const block = (filename: string, code: string) =>
    h(ProsePre, { filename, code, language: 'bash' }, () => code);

  it('shows one tab per block and only the selected panel', async () => {
    const wrapper = mount(CodeGroup, {
      slots: {
        default: () => [block('pnpm', 'pnpm add x'), block('npm', 'npm i x')],
      },
      global: { stubs },
    });
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.map((t) => t.text())).toEqual(['pnpm', 'npm']);
    expect(wrapper.text()).toContain('pnpm add x');
    expect(wrapper.text()).not.toContain('npm i x');

    await tabs[1]!.trigger('click');
    expect(wrapper.text()).toContain('npm i x');
    expect(wrapper.text()).not.toContain('pnpm add x');
    expect(tabs[1]!.attributes('aria-selected')).toBe('true');
  });
});

describe('ProsePre', () => {
  afterEach(() => vi.useRealTimers());

  it('copies the code and confirms for 1500 ms', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const wrapper = mount(ProsePre, {
      props: { code: 'pnpm add x', language: 'bash' },
      slots: { default: 'pnpm add x' },
      global: { stubs },
    });
    const button = wrapper.find('button[data-copy]');
    expect(button.attributes('aria-label')).toBe('Copy code');

    await button.trigger('click');
    await nextTick();
    expect(writeText).toHaveBeenCalledWith('pnpm add x');
    expect(button.attributes('aria-label')).toBe('Copied');

    vi.advanceTimersByTime(1500);
    await nextTick();
    expect(button.attributes('aria-label')).toBe('Copy code');
  });
});
