/**
 * Turns a Docus/UnoCSS icon class (`i-lucide-book`) into an Iconify name
 * (`lucide:book`). Iconify names pass through unchanged.
 */
export function iconifyName(name: string): string {
  if (!name.startsWith('i-')) return name;
  const bare = name.slice(2);
  if (bare.startsWith('simple-icons-')) {
    return `simple-icons:${bare.slice('simple-icons-'.length)}`;
  }
  return bare.replace('-', ':');
}
