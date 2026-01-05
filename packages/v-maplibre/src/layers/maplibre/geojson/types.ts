import type {
  LayerSpecification,
  GeoJSONSourceSpecification,
} from 'maplibre-gl';

export type Props = {
  source: GeoJSONSourceSpecification;
  layer: LayerSpecification;
  sourceId?: string;
  layerId?: string;
  before?: string;
};
