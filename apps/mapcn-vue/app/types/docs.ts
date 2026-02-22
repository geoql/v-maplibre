export interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}
