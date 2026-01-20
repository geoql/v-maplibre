/**
 * Types for ACTransit real-time bus tracking visualization
 *
 * Data comes from https://actransit.val.run API endpoints:
 * - /bus_locations - Current bus positions
 * - /bus_locations_history - Historical positions
 * - /route_stop_predictions - Stop locations and route info
 */

/**
 * Raw bus vehicle data from the GTFS-realtime API
 */
export interface ACTransitVehiclePosition {
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
}

export interface ACTransitTrip {
  tripId: string;
  routeId: string;
}

export interface ACTransitVehicle {
  trip?: ACTransitTrip;
  position: ACTransitVehiclePosition;
  timestamp: number;
}

export interface ACTransitBusData {
  vehicle: ACTransitVehicle;
}

/**
 * Processed bus feature for deck.gl visualization
 */
export interface BusFeature {
  tripId: string;
  routeId: string;
  coordinates: [number, number];
  bearing: number;
  speed: number;
  timestamp: number;
}

/**
 * Processed bus trail (history) for deck.gl PathLayer
 */
export interface BusTrail {
  tripId: string;
  routeId: string;
  path: [number, number][];
  timestamps: number[];
}

/**
 * Stop information from route_stop_predictions API
 */
export interface ACTransitStop {
  stpid: string;
  stpnm: string;
  lat: number;
  lon: number;
  geoid?: string;
}

export interface ACTransitStopResponse {
  'bustime-response': {
    stops: ACTransitStop[];
  };
}

export interface ACTransitRouteStopPrediction {
  routeName: string;
  processedStops: ACTransitStopResponse;
}

/**
 * Processed stop feature for deck.gl visualization
 */
export interface StopFeature {
  stpid: string;
  name: string;
  coordinates: [number, number];
  routeNames: string[];
}

/**
 * Trip average speed tracking
 */
export interface TripAverageSpeeds {
  [tripId: string]: number;
}

/**
 * Active stop filter state
 */
export interface ActiveStopFilter {
  stpid: string;
  routeNames: string[];
}
