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
