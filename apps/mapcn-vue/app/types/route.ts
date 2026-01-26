/**
 * Route-related types for Valhalla routing examples
 */

// Route Planning types
export interface RouteOption {
  coordinates: [number, number][];
  duration: number;
  distance: number;
}

// Multi-stop types
export interface RouteStop {
  name: string;
  coordinates: [number, number];
  icon: string;
  type: 'start' | 'waypoint' | 'end';
}

export interface RouteLegInfo {
  distance: number;
  duration: number;
  summary: string;
}

// Trip Planner types
export type TripActivityType = 'Attraction' | 'Dining';

export interface TripActivity {
  name: string;
  type: TripActivityType;
  time: string;
  coordinates: [number, number];
}

export interface TripStay {
  name: string;
  price: string;
  coordinates: [number, number];
}

export interface TripDayPlan {
  day: number;
  title: string;
  activities: TripActivity[];
  stay: TripStay;
}

export interface TripHighlight {
  name: string;
  coordinates: [number, number];
}

export interface TripData {
  title: string;
  duration: string;
  budget: string;
  highlights: TripHighlight[];
  days: TripDayPlan[];
  routeWaypoints: [number, number][];
}

// Delivery tracking types
export interface DeliveryRouteInfo {
  distance: number;
  duration: number;
}

export interface DeliveryLocation {
  coordinates: [number, number];
}

// Activity badge styling
export interface ActivityBadgeStyle {
  bg: string;
  text: string;
  icon: string;
}

// Valhalla API response types
export interface ValhallaLocation {
  original_index: number;
}

export interface ValhallaLegSummary {
  length: number;
  time: number;
  name?: string;
}

export interface ValhallaLeg {
  shape: string;
  summary: ValhallaLegSummary;
}

export interface ValhallaTripSummary {
  length: number;
  time: number;
}

export interface ValhallaTrip {
  legs: ValhallaLeg[];
  summary: ValhallaTripSummary;
  locations?: ValhallaLocation[];
}

export interface ValhallaAlternate {
  trip: ValhallaTrip;
}

export interface ValhallaResponse {
  trip: ValhallaTrip;
  alternates?: ValhallaAlternate[];
}
