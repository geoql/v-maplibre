import type { DocsNavGroup } from '#shell/types/docs';
import { iconifyName } from '#shell/utils/iconify-name';

/** Nav label and fallback icon per top-level content folder. */
const SECTIONS: Record<string, { label: string; icon: string }> = {
  guide: { label: 'Guide', icon: 'lucide:book-open' },
  components: { label: 'Components', icon: 'lucide:component' },
  layers: { label: 'Layers', icon: 'lucide:layers' },
  controls: { label: 'Controls', icon: 'lucide:sliders-horizontal' },
};

export interface DocsPageRef {
  path: string;
  title: string;
  icon?: string;
}

/**
 * Groups docs pages by their first path segment, in the order given (the
 * collection is sorted by file stem, so folder and file prefixes decide it).
 *
 * @param docs - Pages from the `docs` collection.
 * @param currentPath - The route path, marked active.
 */
export function buildDocsNav(
  docs: readonly DocsPageRef[],
  currentPath: string,
): DocsNavGroup[] {
  const groups = new Map<string, DocsNavGroup>();
  for (const doc of docs) {
    const key = doc.path.split('/')[1] ?? '';
    const section = SECTIONS[key] ?? { label: key, icon: 'lucide:file-text' };
    let group = groups.get(key);
    if (!group) {
      group = { label: section.label, items: [] };
      groups.set(key, group);
    }
    group.items.push({
      title: doc.title,
      path: doc.path,
      active: doc.path === currentPath,
      icon: doc.icon ? iconifyName(doc.icon) : section.icon,
    });
  }
  return [...groups.values()];
}
