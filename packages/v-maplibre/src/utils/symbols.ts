import type { Map } from 'maplibre-gl';
import type { Protocol } from 'pmtiles';
import type { InjectionKey, Ref } from 'vue';

const MapKey: InjectionKey<Ref<Map | null>> = Symbol('Map');
const PMTileProtocolKey: InjectionKey<Protocol | null> = Symbol('Protocol');

export { MapKey, PMTileProtocolKey };
