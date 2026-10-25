import type { OutboundTarget } from '~/types/analytics';

/** Which funnel outbound target a link points at, or `null` for any other link. */
export function outboundTarget(href: string): OutboundTarget | null {
  let host: string;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  if (host === 'github.com' || host.endsWith('.github.com')) return 'github';
  if (host === 'npmjs.com' || host.endsWith('.npmjs.com')) return 'npm';
  return null;
}

/** The slug after `prefix` in `path` (`/examples/basic` → `basic`), or `null`. */
export function slugAfter(path: string, prefix: string): string | null {
  if (!path.startsWith(prefix)) return null;
  const slug = path.slice(prefix.length).replace(/\/+$/, '');
  return slug.length > 0 ? slug : null;
}
