# GeoArrow Demo Data

Synthetic Apache Arrow IPC files used by the `/examples/deckgl-geoarrow-*` showcase pages.

Each file's `geometry` column carries the `ARROW:extension:name` metadata
(`geoarrow.point`, `geoarrow.linestring`, `geoarrow.multilinestring`,
`geoarrow.multipolygon`) so the v-maplibre GeoArrow wrappers can read the
column directly off the Arrow `Table` without an explicit
`getPosition`/`getPath`/`getPolygon` accessor.

| File                                    | Geometry                | Rows | Used by                                                |
| --------------------------------------- | ----------------------- | ---- | ------------------------------------------------------ |
| `natural-earth_cities-clusters.arrows`  | Point                   | 21   | `deckgl-geoarrow-scatterplot`, `-multipoint`, `-mixed` |
| `city-labels.arrows`                    | Point + name            | 5    | `deckgl-geoarrow-text`                                 |
| `famous-routes.arrows`                  | LineString              | 3    | `deckgl-geoarrow-path`, `-mixed`                       |
| `natural-earth_countries-bounds.arrows` | MultiLineString         | 5    | `deckgl-geoarrow-linestring`                           |
| `city-trips.arrows`                     | LineString + timestamps | 2    | `deckgl-geoarrow-triplines`                            |
| `nyc-boroughs.arrows`                   | MultiPolygon            | 3    | `deckgl-geoarrow-polygon-nyc`, `-mixed`                |

## Regenerating

Use the `generate.ts` script in this directory. It uses the workspace's
`apache-arrow` dependency and runs natively under Node 26's built-in
TypeScript type stripping — no transpile step required:

```sh
node apps/mapcn-vue/public/geoarrow/generate.ts
```
