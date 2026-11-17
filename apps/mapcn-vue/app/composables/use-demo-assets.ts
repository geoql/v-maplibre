/**
 * Absolute URLs for the demo assets served by this site's key-holding proxy
 * (server/routes/demo-assets). URLs are absolute because MapLibre and the
 * splat / 3D Tiles loaders fetch from Web Workers, where a root-relative
 * path would not resolve against the page origin.
 */
export function useDemoAssets() {
  const origin = useRequestURL().origin;
  const base = `${origin}/demo-assets`;

  return {
    /** TileJSON for the Garhwal Himalaya Terrain-RGB (mapbox encoding) DEM. */
    himalayaTerrainTileJson: `${base}/tiles/garhwal-himalaya.json`,
    /** Gaussian splat scene (.spz) for the cactus capture. */
    cactusSplat: `${base}/assets/splat/cactus/scene.spz`,
    /** 3D Tiles tileset for the cactus capture; tile URIs resolve relative to it. */
    cactusTileset: `${base}/assets/splat/cactus/tileset.json`,
  };
}
