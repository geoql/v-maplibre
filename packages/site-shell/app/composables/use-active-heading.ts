import type { Ref } from 'vue';
import { activeHeadingId } from '#shell/utils/active-heading';

/**
 * Tracks which heading matching `selector` the reader is on, for the table
 * of contents. Re-reads the headings on every scroll, so content swapped in
 * by a route change is picked up.
 *
 * @param selector - CSS selector for the headings.
 * @param offset - Toolbar height in px.
 */
export function useActiveHeading(selector: string, offset = 100): Ref<string> {
  const active = ref('');

  const update = (): void => {
    const headings = Array.from(document.querySelectorAll(selector), (el) => ({
      id: el.id,
      top: el.getBoundingClientRect().top,
    }));
    active.value = activeHeadingId(headings, offset);
  };

  onMounted(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
  });
  onUnmounted(() => window.removeEventListener('scroll', update));

  return active;
}
