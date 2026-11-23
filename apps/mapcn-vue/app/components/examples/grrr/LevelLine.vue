<script setup lang="ts">
  /** A dashed flood-level line with its label, inside a chart's SVG. */
  defineProps<{ y: number; width: number; label: string }>();
</script>

<template>
  <g>
    <line
      x1="0"
      :x2="width"
      :y1="y"
      :y2="y"
      class="stroke-muted-foreground/50"
      stroke-dasharray="3 3"
      stroke-width="0.75"
    />
    <text
      :x="width"
      :y="y - 2"
      text-anchor="end"
      class="fill-muted-foreground font-mono text-4xs"
    >
      {{ label }}
    </text>
  </g>
</template>
