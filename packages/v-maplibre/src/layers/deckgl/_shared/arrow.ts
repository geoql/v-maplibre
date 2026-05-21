import type { ArrowTableLike } from './types';

type StructChildData = { values?: Float64Array };
type StructData = { children?: StructChildData[]; length: number };
type ListData = {
  valueOffsets?: Int32Array;
  children?: { type?: unknown }[];
  length: number;
  values?: unknown;
};

type RawData = StructData & {
  type?: { children?: { name?: string }[] };
};

type RawList = ListData & {
  type?: { children?: { name?: string }[] };
};

const getColumn = (
  table: ArrowTableLike,
  name: string,
): { data: unknown[] } | null => {
  const lookup = table as unknown as {
    getChild: (n: string) => { data: unknown[] } | null;
  };
  return lookup.getChild(name);
};

const interleave = (struct: RawData): Float64Array => {
  const xs = struct.children?.[0]?.values;
  const ys = struct.children?.[1]?.values;
  const zs = struct.children?.[2]?.values;
  if (!xs || !ys) return new Float64Array(0);
  const n = struct.length;
  const out = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = xs[i] ?? 0;
    out[i * 3 + 1] = ys[i] ?? 0;
    out[i * 3 + 2] = zs ? (zs[i] ?? 0) : 0;
  }
  return out;
};

export type GeoArrowPointExtract = {
  positions: Float64Array;
  length: number;
};

export const extractPoints = (
  table: ArrowTableLike,
  column = 'geometry',
): GeoArrowPointExtract | null => {
  const col = getColumn(table, column);
  if (!col) return null;
  const data = col.data[0] as RawData | undefined;
  if (!data || !data.children) return null;
  const positions = interleave(data);
  if (positions.length === 0) return null;
  return { positions, length: data.length };
};

export type GeoArrowPathExtract = {
  positions: Float64Array;
  startIndices: Int32Array;
  length: number;
};

export const extractLineStrings = (
  table: ArrowTableLike,
  column = 'geometry',
): GeoArrowPathExtract | null => {
  const col = getColumn(table, column);
  if (!col) return null;
  const list = col.data[0] as RawList | undefined;
  if (!list || !list.valueOffsets) return null;
  const innerStruct = (list as unknown as { children?: RawData[] })
    .children?.[0];
  if (!innerStruct) return null;
  const positions = interleave(innerStruct);
  if (positions.length === 0) return null;
  return {
    positions,
    startIndices: Int32Array.from(list.valueOffsets),
    length: list.length,
  };
};

export type GeoArrowMultiPathExtract = {
  positions: Float64Array;
  startIndices: Int32Array;
  length: number;
};

export const extractMultiLineStrings = (
  table: ArrowTableLike,
  column = 'geometry',
): GeoArrowMultiPathExtract | null => {
  const col = getColumn(table, column);
  if (!col) return null;
  const outer = col.data[0] as RawList | undefined;
  if (!outer || !outer.valueOffsets) return null;
  const innerList = (outer as unknown as { children?: RawList[] })
    .children?.[0];
  if (!innerList || !innerList.valueOffsets) return null;
  const struct = (innerList as unknown as { children?: RawData[] })
    .children?.[0];
  if (!struct) return null;
  const positions = interleave(struct);
  if (positions.length === 0) return null;
  return {
    positions,
    startIndices: Int32Array.from(innerList.valueOffsets),
    length: innerList.length,
  };
};

export type GeoArrowPolygonExtract = {
  positions: Float64Array;
  polygonIndices: Int32Array;
  primitivePolygonIndices: Int32Array;
  length: number;
};

export const extractPolygons = (
  table: ArrowTableLike,
  column = 'geometry',
): GeoArrowPolygonExtract | null => {
  const col = getColumn(table, column);
  if (!col) return null;
  const outer = col.data[0] as RawList | undefined;
  if (!outer || !outer.valueOffsets) return null;
  const rings = (outer as unknown as { children?: RawList[] }).children?.[0];
  if (!rings || !rings.valueOffsets) return null;
  const struct = (rings as unknown as { children?: RawData[] }).children?.[0];
  if (!struct) return null;
  const positions = interleave(struct);
  if (positions.length === 0) return null;
  return {
    positions,
    polygonIndices: Int32Array.from(outer.valueOffsets),
    primitivePolygonIndices: Int32Array.from(rings.valueOffsets),
    length: outer.length,
  };
};

export type GeoArrowMultiPolygonExtract = GeoArrowPolygonExtract;

export const extractMultiPolygons = (
  table: ArrowTableLike,
  column = 'geometry',
): GeoArrowMultiPolygonExtract | null => {
  const col = getColumn(table, column);
  if (!col) return null;
  const outer = col.data[0] as RawList | undefined;
  if (!outer || !outer.valueOffsets) return null;
  const polysList = (outer as unknown as { children?: RawList[] })
    .children?.[0];
  if (!polysList || !polysList.valueOffsets) return null;
  const ringsList = (polysList as unknown as { children?: RawList[] })
    .children?.[0];
  if (!ringsList || !ringsList.valueOffsets) return null;
  const struct = (ringsList as unknown as { children?: RawData[] })
    .children?.[0];
  if (!struct) return null;
  const positions = interleave(struct);
  if (positions.length === 0) return null;
  return {
    positions,
    polygonIndices: Int32Array.from(polysList.valueOffsets),
    primitivePolygonIndices: Int32Array.from(ringsList.valueOffsets),
    length: outer.length,
  };
};

export type RingPolygons = number[][][];

export const polygonsToRingArrays = (
  geom: GeoArrowMultiPolygonExtract,
): RingPolygons => {
  const { positions, polygonIndices, primitivePolygonIndices } = geom;
  const result: RingPolygons = [];
  for (let p = 0; p < polygonIndices.length - 1; p++) {
    const polyStart = polygonIndices[p] ?? 0;
    const polyEnd = polygonIndices[p + 1] ?? 0;
    for (let r = polyStart; r < polyEnd; r++) {
      const ringStart = primitivePolygonIndices[r] ?? 0;
      const ringEnd = primitivePolygonIndices[r + 1] ?? 0;
      const ring: number[][] = [];
      for (let v = ringStart; v < ringEnd; v++) {
        const x = positions[v * 3] ?? 0;
        const y = positions[v * 3 + 1] ?? 0;
        ring.push([x, y]);
      }
      if (ring.length) result.push(ring);
    }
  }
  return result;
};

export const linestringsToCoordArrays = (
  geom: GeoArrowPathExtract,
): number[][][] => {
  const { positions, startIndices } = geom;
  const result: number[][][] = [];
  for (let i = 0; i < startIndices.length - 1; i++) {
    const start = startIndices[i] ?? 0;
    const end = startIndices[i + 1] ?? 0;
    const line: number[][] = [];
    for (let v = start; v < end; v++) {
      const x = positions[v * 3] ?? 0;
      const y = positions[v * 3 + 1] ?? 0;
      line.push([x, y]);
    }
    if (line.length) result.push(line);
  }
  return result;
};

export const pointsToCoordArray = (geom: GeoArrowPointExtract): number[][] => {
  const { positions, length } = geom;
  const result: number[][] = [];
  for (let i = 0; i < length; i++) {
    result.push([positions[i * 3] ?? 0, positions[i * 3 + 1] ?? 0]);
  }
  return result;
};

export const filterDefined = (
  source: Record<string, unknown>,
  exclude: ReadonlySet<string>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (exclude.has(key) || value === undefined) continue;
    out[key] = value;
  }
  return out;
};
