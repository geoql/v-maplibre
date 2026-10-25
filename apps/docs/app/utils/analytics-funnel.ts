import type {
  ComponentSection,
  OutboundTarget,
  PackageManagerId,
} from '~/types/analytics';

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

const COMPONENT_SECTIONS: readonly ComponentSection[] = [
  'components',
  'layers',
  'controls',
];

/** The component section + slug of a docs path (`/layers/core-layers`), or `null`. */
export function componentPage(
  path: string,
): { section: ComponentSection; slug: string } | null {
  const [section, ...rest] = path.split('/').filter(Boolean);
  const match = COMPONENT_SECTIONS.find((s) => s === section);
  if (!match || rest.length === 0) return null;
  return { section: match, slug: rest.join('/') };
}

const INSTALL_COMMAND =
  /^(npm|pnpm|yarn|bun)\s+(?:add|install|i)\s+(?:-\S+\s+)*(\S.*)$/;

/** Package manager + package list of an install command, or `null` for other code. */
export function installCommand(
  code: string,
): { packageManager: PackageManagerId; packages: string } | null {
  const match = INSTALL_COMMAND.exec(code.trim());
  if (!match) return null;
  const [, manager, packages] = match;
  if (
    packages === undefined ||
    (manager !== 'npm' &&
    manager !== 'pnpm' &&
    manager !== 'yarn' &&
      manager !== 'bun')
  ) {
    return null;
  }
  return { packageManager: manager, packages: packages.trim() };
}
