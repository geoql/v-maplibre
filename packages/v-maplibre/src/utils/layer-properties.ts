import type {
  LayerSpecification,
  Map,
  PaintPropertyEntry,
  StyleLayer,
} from 'maplibre-gl';

type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type LayoutOf<L> = L extends { layout?: infer Layout }
  ? NonNullable<Layout>
  : never;

/**
 * One `{ name, value }` pair per paint property. `PaintPropertyEntry` is built
 * from optional keys, so it also carries `undefined`, which is dropped here.
 */
type PaintEntry = NonNullable<PaintPropertyEntry>;

/**
 * Every MapLibre paint property, keyed by name, each with its own value type.
 * Mirrors the style spec's `AllPaintProperties`, which `maplibre-gl` uses but
 * does not export.
 */
export type PaintProperties = {
  [Name in PaintEntry['name']]?: Extract<PaintEntry, { name: Name }>['value'];
};

/**
 * Every MapLibre layout property, keyed by name, each with its own value type.
 * Mirrors the style spec's `AllLayoutProperties`, built from the layout of
 * every layer type in `LayerSpecification`.
 */
export type LayoutProperties = UnionToIntersection<
  LayoutOf<LayerSpecification>
>;

/** Name of a MapLibre paint property, e.g. `'fill-opacity'`. */
export type PaintPropertyName = keyof PaintProperties;

/**
 * The own keys of a paint or layout object.
 *
 * `Object.keys` always returns `string[]`. This is the one place that narrows
 * them. It is sound because callers only pass values typed as a MapLibre
 * paint or layout spec, so every own key is a property name of that spec.
 */
const specKeys = <T extends PaintProperties | LayoutProperties>(
  spec: T,
): Array<keyof T> => Object.keys(spec) as Array<keyof T>;

/**
 * Predicate that decides whether one property is written. It gets the
 * property name and the new value.
 */
export type PropertyFilter = (name: string, value: unknown) => boolean;

/** Write every property of `paint` to the layer with `setPaintProperty`. */
export const setPaintProperties = (
  map: Map,
  layerId: string,
  paint: PaintProperties | undefined,
  shouldSet: PropertyFilter = () => true,
): void => {
  if (!paint) return;
  for (const name of specKeys(paint)) {
    const value = paint[name];
    if (shouldSet(name, value)) map.setPaintProperty(layerId, name, value);
  }
};

/** Write every property of `layout` to the layer with `setLayoutProperty`. */
export const setLayoutProperties = (
  map: Map,
  layerId: string,
  layout: LayoutProperties | undefined,
  shouldSet: PropertyFilter = () => true,
): void => {
  if (!layout) return;
  for (const name of specKeys(layout)) {
    const value = layout[name];
    if (shouldSet(name, value)) map.setLayoutProperty(layerId, name, value);
  }
};

/**
 * Whether `name` is a paint property that is set on `layer`.
 *
 * A key of the layer's serialized paint object is, by the paint spec type, a
 * paint property name.
 */
export const isSetPaintProperty = (
  layer: StyleLayer,
  name: string,
): name is PaintPropertyName => name in (layer.serialize().paint ?? {});
