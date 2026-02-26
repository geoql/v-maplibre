/**
 * HHI (Herfindahl-Hirschman Index) Map types
 * For US Vehicle Market Concentration map example
 */

export interface HhiConfig {
  groupVars: GroupVar[];
  hhiVars: HhiVar[];
  years: number[];
}

export interface GroupVar {
  label: string;
  code: string;
  levels: Level[];
  excludeHhi?: string;
}

export interface Level {
  label: string;
  code: string;
}

export interface HhiVar {
  label: string;
  code: string;
}

export interface HhiDataProperties {
  [key: string]: number | null;
}
