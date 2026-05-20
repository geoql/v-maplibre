#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Field,
  Float64,
  Int64,
  List,
  RecordBatch,
  RecordBatchFileWriter,
  Schema,
  Struct,
  Table,
  Utf8,
  makeData,
  vectorFromArray,
  type Data,
} from 'apache-arrow';

type XY = readonly [number, number];
type LineString = readonly XY[];
type MultiLineString = readonly LineString[];
type Polygon = readonly LineString[];
type MultiPolygon = readonly Polygon[];

const OUT = dirname(fileURLToPath(import.meta.url));

const POINT_STRUCT = new Struct([
  new Field('x', new Float64()),
  new Field('y', new Float64()),
]);

function extMeta(name: string): Map<string, string> {
  return new Map([
    ['ARROW:extension:name', name],
    ['ARROW:extension:metadata', '{"crs":null,"crs_type":"unknown"}'],
  ]);
}

function pointField(name: string, extName: string): Field {
  return new Field(name, POINT_STRUCT, false, extMeta(extName));
}

function listField(name: string, extName: string, innerField: Field): Field {
  return new Field(name, new List(innerField), false, extMeta(extName));
}

function pointData(coords: readonly XY[]): Data<Struct> {
  const n = coords.length;
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    xs[i] = coords[i]![0];
    ys[i] = coords[i]![1];
  }
  return makeData({
    type: POINT_STRUCT,
    length: n,
    nullCount: 0,
    children: [
      makeData({ type: new Float64(), data: xs }),
      makeData({ type: new Float64(), data: ys }),
    ],
  });
}

function listData(
  innerField: Field,
  innerData: Data,
  offsets: readonly number[],
): Data<List> {
  return makeData({
    type: new List(innerField),
    length: offsets.length - 1,
    nullCount: 0,
    valueOffsets: Int32Array.from(offsets),
    child: innerData,
  });
}

function linestringData(
  linestrings: readonly LineString[],
  vertexField: Field,
): Data<List> {
  const flat: XY[] = [];
  const offsets: number[] = [0];
  for (const ls of linestrings) {
    for (const v of ls) flat.push(v);
    offsets.push(flat.length);
  }
  return listData(vertexField, pointData(flat), offsets);
}

function multilinestringData(
  rows: readonly MultiLineString[],
  vertexField: Field,
  lineField: Field,
): Data<List> {
  const flat: XY[] = [];
  const innerOff: number[] = [0];
  const outerOff: number[] = [0];
  for (const row of rows) {
    for (const ls of row) {
      for (const v of ls) flat.push(v);
      innerOff.push(flat.length);
    }
    outerOff.push(innerOff.length - 1);
  }
  const inner = listData(vertexField, pointData(flat), innerOff);
  return listData(lineField, inner, outerOff);
}

function multipolygonData(
  rows: readonly MultiPolygon[],
  vertexField: Field,
  ringField: Field,
  polyField: Field,
): Data<List> {
  const flat: XY[] = [];
  const ringOff: number[] = [0];
  const polyOff: number[] = [0];
  const mpolyOff: number[] = [0];
  for (const mpoly of rows) {
    for (const poly of mpoly) {
      for (const ring of poly) {
        for (const v of ring) flat.push(v);
        ringOff.push(flat.length);
      }
      polyOff.push(ringOff.length - 1);
    }
    mpolyOff.push(polyOff.length - 1);
  }
  const rings = listData(vertexField, pointData(flat), ringOff);
  const polys = listData(ringField, rings, polyOff);
  return listData(polyField, polys, mpolyOff);
}

function strData(values: readonly string[]): Data<Utf8> {
  return vectorFromArray(values, new Utf8()).data[0]!;
}

function listInt64Data(rows: readonly (readonly number[])[]): Data<List> {
  const flat: bigint[] = [];
  const offsets: number[] = [0];
  for (const r of rows) {
    for (const x of r) flat.push(BigInt(x));
    offsets.push(flat.length);
  }
  const inner = makeData({
    type: new Int64(),
    data: BigInt64Array.from(flat),
  });
  return makeData({
    type: new List(new Field('item', new Int64())),
    length: offsets.length - 1,
    nullCount: 0,
    valueOffsets: Int32Array.from(offsets),
    child: inner,
  });
}

function writeArrow(
  filename: string,
  schema: Schema,
  columnDatas: readonly Data[],
): void {
  const recordBatch = new RecordBatch(
    schema,
    makeData({
      type: new Struct(schema.fields),
      length: columnDatas[0]!.length,
      nullCount: 0,
      children: columnDatas as Data[],
    }),
  );
  const table = new Table(schema, [recordBatch]);
  const writer = RecordBatchFileWriter.writeAll(table);
  const buffer = Buffer.from(writer.toUint8Array(true));
  const out = join(OUT, filename);
  writeFileSync(out, buffer);
  console.log(
    `  wrote ${filename}  rows=${table.numRows}  size=${buffer.length}B`,
  );
}

type NamedCity = readonly [name: string, x: number, y: number];

function genCities(): void {
  const cities: readonly NamedCity[] = [
    ['New York', -74.006, 40.713],
    ['Boston', -71.058, 42.36],
    ['Philadelphia', -75.165, 39.952],
    ['Washington DC', -77.037, 38.907],
    ['London', -0.128, 51.508],
    ['Paris', 2.352, 48.857],
    ['Brussels', 4.351, 50.851],
    ['Amsterdam', 4.9, 52.367],
    ['Berlin', 13.405, 52.52],
    ['Tokyo', 139.692, 35.69],
    ['Osaka', 135.502, 34.694],
    ['Seoul', 126.978, 37.567],
    ['Shanghai', 121.474, 31.231],
    ['Sydney', 151.209, -33.868],
    ['Melbourne', 144.963, -37.814],
    ['Auckland', 174.764, -36.848],
    ['Sao Paulo', -46.633, -23.55],
    ['Rio de Janeiro', -43.196, -22.908],
    ['Buenos Aires', -58.382, -34.603],
    ['Santiago', -70.673, -33.448],
    ['Lima', -77.043, -12.046],
  ];
  const geom = pointData(cities.map((c): XY => [c[1], c[2]]));
  const names = strData(cities.map((c) => c[0]));
  const schema = new Schema([
    pointField('geometry', 'geoarrow.point'),
    new Field('name', new Utf8()),
  ]);
  writeArrow('natural-earth_cities-clusters.arrows', schema, [geom, names]);
}

function genCityLabels(): void {
  const labels: readonly NamedCity[] = [
    ['New York', -74.006, 40.713],
    ['London', -0.128, 51.508],
    ['Tokyo', 139.692, 35.69],
    ['Sydney', 151.209, -33.868],
    ['Sao Paulo', -46.633, -23.55],
  ];
  const geom = pointData(labels.map((c): XY => [c[1], c[2]]));
  const names = strData(labels.map((c) => c[0]));
  const schema = new Schema([
    pointField('geometry', 'geoarrow.point'),
    new Field('name', new Utf8()),
  ]);
  writeArrow('city-labels.arrows', schema, [geom, names]);
}

function genFamousRoutes(): void {
  const routes: readonly LineString[] = [
    [
      [-122.42, 37.77],
      [-115.17, 36.17],
      [-105.27, 40.01],
      [-95.36, 41.26],
      [-87.65, 41.85],
      [-74.006, 40.713],
    ],
    [
      [-0.128, 51.508],
      [37.62, 55.75],
      [76.95, 43.25],
      [104.07, 30.67],
      [139.692, 35.69],
    ],
    [
      [31.235, 30.044],
      [31.45, 30.55],
      [31.78, 31.1],
      [32.22, 31.45],
      [32.55, 31.2],
    ],
  ];
  const vertexField = new Field('vertices', POINT_STRUCT);
  const geom = linestringData(routes, vertexField);
  const schema = new Schema([
    listField('geometry', 'geoarrow.linestring', vertexField),
  ]);
  writeArrow('famous-routes.arrows', schema, [geom]);
}

function genCountryBounds(): void {
  const bounds: readonly MultiLineString[] = [
    [
      [
        [-125, 49],
        [-66, 49],
        [-66, 24],
        [-125, 24],
        [-125, 49],
      ],
    ],
    [
      [
        [68, 36],
        [97, 36],
        [97, 8],
        [68, 8],
        [68, 36],
      ],
    ],
    [
      [
        [-74, 5],
        [-34, 5],
        [-34, -34],
        [-74, -34],
        [-74, 5],
      ],
    ],
    [
      [
        [112, -10],
        [154, -10],
        [154, -44],
        [112, -44],
        [112, -10],
      ],
    ],
    [
      [
        [20, 41],
        [180, 41],
        [180, 82],
        [20, 82],
        [20, 41],
      ],
      [
        [-180, 41],
        [-169, 41],
        [-169, 82],
        [-180, 82],
        [-180, 41],
      ],
    ],
  ];
  const vertexField = new Field('vertices', POINT_STRUCT);
  const lineField = new Field('linestrings', new List(vertexField));
  const geom = multilinestringData(bounds, vertexField, lineField);
  const schema = new Schema([
    listField('geometry', 'geoarrow.multilinestring', lineField),
    new Field('name', new Utf8()),
  ]);
  const names = strData(['USA', 'India', 'Brazil', 'Australia', 'Russia']);
  writeArrow('natural-earth_countries-bounds.arrows', schema, [geom, names]);
}

function genCityTrips(): void {
  const paths: readonly LineString[] = [
    [
      [-122.42, 37.77],
      [-118.24, 34.05],
      [-112.07, 33.45],
    ],
    [
      [-0.128, 51.508],
      [2.352, 48.857],
      [13.405, 52.52],
    ],
  ];
  const trips: readonly (readonly number[])[] = [
    [0, 3000, 6000],
    [0, 2500, 5500],
  ];
  const vertexField = new Field('vertices', POINT_STRUCT);
  const geom = linestringData(paths, vertexField);
  const ts = listInt64Data(trips);
  const schema = new Schema([
    listField('geometry', 'geoarrow.linestring', vertexField),
    new Field('timestamps', new List(new Field('item', new Int64()))),
  ]);
  writeArrow('city-trips.arrows', schema, [geom, ts]);
}

type NamedMultiPolygon = readonly [name: string, geom: MultiPolygon];

function genNycBoroughs(): void {
  const boroughs: readonly NamedMultiPolygon[] = [
    [
      'Manhattan',
      [
        [
          [
            [-74.02, 40.7],
            [-73.93, 40.7],
            [-73.93, 40.88],
            [-74.02, 40.88],
            [-74.02, 40.7],
          ],
        ],
      ],
    ],
    [
      'Brooklyn',
      [
        [
          [
            [-74.04, 40.57],
            [-73.86, 40.57],
            [-73.86, 40.74],
            [-74.04, 40.74],
            [-74.04, 40.57],
          ],
        ],
      ],
    ],
    [
      'Queens',
      [
        [
          [
            [-73.96, 40.55],
            [-73.7, 40.55],
            [-73.7, 40.8],
            [-73.96, 40.8],
            [-73.96, 40.55],
          ],
        ],
      ],
    ],
  ];
  const vertexField = new Field('vertices', POINT_STRUCT);
  const ringField = new Field('rings', new List(vertexField));
  const polyField = new Field('polygons', new List(ringField));
  const geom = multipolygonData(
    boroughs.map((b) => b[1]),
    vertexField,
    ringField,
    polyField,
  );
  const schema = new Schema([
    new Field('name', new Utf8()),
    listField('geometry', 'geoarrow.multipolygon', polyField),
  ]);
  const names = strData(boroughs.map((b) => b[0]));
  writeArrow('nyc-boroughs.arrows', schema, [names, geom]);
}

console.log(`Generating GeoArrow demo files to: ${OUT}`);
genCities();
genCityLabels();
genFamousRoutes();
genCountryBounds();
genCityTrips();
genNycBoroughs();
console.log('done.');
