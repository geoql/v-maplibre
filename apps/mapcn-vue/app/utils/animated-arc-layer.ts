// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Adapted from: https://github.com/visgl/deck.gl/blob/9.2-release/examples/website/maplibre/animated-arc-layer.ts

import { ArcLayer } from '@deck.gl/layers';
import type { ArcLayerProps } from '@deck.gl/layers';
import type { Accessor } from '@deck.gl/core';
import type { ShaderModule } from '@luma.gl/shadertools';

const uniformBlock = `\
uniform tripsUniforms {
  vec2 timeRange;
} trips;
`;

export type TripsProps = {
  timeRange: [number, number];
};

export const tripsUniforms = {
  name: 'trips',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    timeRange: 'vec2<f32>',
  },
} as const satisfies ShaderModule<TripsProps>;

export type AnimatedArcLayerProps<DataT = unknown> = {
  getSourceTimestamp?: Accessor<DataT, number>;
  getTargetTimestamp?: Accessor<DataT, number>;
  timeRange?: [number, number];
} & ArcLayerProps<DataT>;

export default class AnimatedArcLayer<DataT = unknown> extends ArcLayer<
  DataT,
  AnimatedArcLayerProps<DataT>
> {
  static override layerName = 'AnimatedArcLayer';

  override getShaders() {
    const shaders = super.getShaders();
    shaders.inject = {
      'vs:#decl': `\
in float instanceSourceTimestamp;
in float instanceTargetTimestamp;
out float vTimestamp;
`,
      'vs:#main-end': `\
vTimestamp = mix(instanceSourceTimestamp, instanceTargetTimestamp, segmentRatio);
`,
      'fs:#decl': `\
in float vTimestamp;
`,
      'fs:#main-start': `\
if (vTimestamp < trips.timeRange.x || vTimestamp > trips.timeRange.y) {
  discard;
}
`,
      'fs:DECKGL_FILTER_COLOR': `\
color.a *= (vTimestamp - trips.timeRange.x) / (trips.timeRange.y - trips.timeRange.x);
`,
    };
    shaders.modules = [...shaders.modules, tripsUniforms];
    return shaders;
  }

  override initializeState() {
    super.initializeState();
    this.getAttributeManager()!.addInstanced({
      instanceSourceTimestamp: {
        size: 1,
        accessor: 'getSourceTimestamp',
      },
      instanceTargetTimestamp: {
        size: 1,
        accessor: 'getTargetTimestamp',
      },
    });
  }

  override draw(params: Parameters<ArcLayer['draw']>[0]) {
    const timeRange = this.props.timeRange ?? [0, 1];
    const tripsProps: TripsProps = { timeRange };
    const model = this.state.model!;
    model.shaderInputs.setProps({ trips: tripsProps });
    super.draw(params);
  }
}
