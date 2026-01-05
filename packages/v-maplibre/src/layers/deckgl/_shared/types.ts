export type Color = [number, number, number] | [number, number, number, number];
export type Position = [number, number] | [number, number, number];

export type Accessor<In, Out> =
  | Out
  | ((
      object: In,
      objectInfo?: { index: number; data: unknown; target: number[] },
    ) => Out);

export type ColorAccessor<D> = Accessor<D, Color>;
export type NumberAccessor<D> = Accessor<D, number>;
export type PositionAccessor<D> = Accessor<D, Position>;
export type StringAccessor<D> = Accessor<D, string>;

export interface BaseDeckLayerProps {
  id: string;
  visible?: boolean;
  opacity?: number;
  pickable?: boolean;
  autoHighlight?: boolean;
  highlightColor?: Color;
  beforeId?: string;
}

export interface DeckLayerEvent<D = unknown> {
  object?: D;
  index: number;
  x: number;
  y: number;
  coordinate?: [number, number];
  layer?: unknown;
  viewport?: unknown;
}
