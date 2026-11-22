export interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

export interface DocsNavItem {
  title: string;
  path: string;
  active: boolean;
  icon: string;
}

/** A flattened table-of-contents entry. */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** A titled group of docs navigation links. */
export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

/** A link in the shared site toolbar. */
export interface SiteLink {
  label: string;
  to: string;
  /** Iconify name, for example `lucide:map`. */
  icon: string;
  /** Opens in a new tab without an opener. */
  external?: boolean;
}
