import type { Ref } from 'vue';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { requirePeer } from '../../../utils';
import {
  provideDeckOverlay,
  registerDeckOverlayLoader,
  type UseDeckOverlayOptions,
  type UseDeckOverlayReturn,
} from './deckOverlayContext';

export {
  DeckLayersKey,
  DeckOverlayKey,
  useDeckLayers,
} from './deckOverlayContext';

const loadMapboxOverlay = () =>
  requirePeer(
    '@deck.gl/mapbox',
    () => import('@deck.gl/mapbox'),
    'pnpm add @deck.gl/core @deck.gl/mapbox',
  );

/**
 * Returns the deck.gl overlay context of the surrounding `VMap`, or provides
 * one when there is none. Registers the `@deck.gl/mapbox` loader the overlay
 * needs; it lives here, in the `/deck.gl` subpath, so the core entry never
 * references the optional peer (issue #187).
 *
 * @param map - The MapLibre map.
 * @param options - Overlay options, used only when this call provides.
 */
export function useDeckOverlay(
  map: Ref<MapLibreMap | null>,
  options: UseDeckOverlayOptions = {},
): UseDeckOverlayReturn {
  registerDeckOverlayLoader(loadMapboxOverlay);
  return provideDeckOverlay(map, options);
}
