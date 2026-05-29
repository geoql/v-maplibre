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
  id: string;
  label: string;
  prefix: string;
}
