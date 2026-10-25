import type { PackageManagerId } from '~/types/analytics';

export interface Example {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  /**
   * Optional grouping label used by `ExamplesIndexSection` to render sub-headers
   * within a category (e.g. "Maritime", "Air", "Land" inside Defense & C4ISR).
   * Examples that omit `subsection` render under an implicit "General" group
   * when ANY sibling in the same category declares a subsection.
   */
  subsection?: string;
}

export interface ExampleCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: Example[];
  /**
   * Optional explicit subsection display order. If omitted, subsections are
   * rendered in first-seen order from the `examples` array.
   */
  subsectionOrder?: string[];
}

export interface ExampleSubsection {
  /** Display label, e.g. "Maritime". `null` means the implicit "Other" group. */
  label: string | null;
  examples: Example[];
}

export interface PackageManager {
  id: PackageManagerId;
  label: string;
  prefix: string;
}

/** Props for the collapsible docs sections beside each example's live map. */
export interface ExampleDocsSectionsProps {
  /** Dedented Vue source of the example (the Usage snippet). */
  code: string;
  /** Shiki HTML for `code`; empty on the server and until Shiki loads. */
  highlightedHtml: string;
  /** Code panel height cap: `lg` in the desktop side panel, `sm` in the mobile sheet. */
  size?: 'sm' | 'lg';
}

/** One `@geoql/v-maplibre` component an example imports, with its entry point. */
export interface ExampleComponentRef {
  name: string;
  /** Import path, e.g. `@geoql/v-maplibre` or `@geoql/v-maplibre/lidar`. */
  from: string;
}

/** Props for the live preview at the top of each /examples gallery card. */
export interface ExamplePreviewProps {
  /** Example route, e.g. `/examples/deckgl-arc`. Keys the live slot and the page module. */
  href: string;
  /** Iconify name shown until the preview gets a live slot (and on the server). */
  icon: string;
}
