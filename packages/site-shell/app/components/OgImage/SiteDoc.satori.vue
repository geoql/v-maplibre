<script setup lang="ts">
  withDefaults(
    defineProps<{
      title?: string;
      description?: string;
      category?: string;
      /** Site name in the footer. */
      brand?: string;
      /** Site domain in the footer. */
      domain?: string;
    }>(),
    {
      title: 'mapcn-vue',
      description: 'Beautiful map components for Vue.',
      category: '',
      brand: 'mapcn-vue',
      domain: 'mapcn-vue.geoql.in',
    },
  );
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      // Satori 0.47 uses native CSS box sizing: without border-box the 60px
      // padding grows the root past the canvas and clips the branding row.
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      backgroundColor: '#0a0a0f',
      padding: '60px',
      fontFamily: 'Geist, sans-serif',
    }"
  >
    <!--
      Font weights sit in static `style="font-weight: N"` attributes, not in the
      :style objects: nuxt-og-image 7 scans templates for CSS `font-weight`
      declarations to pick which static Geist weights to ship to Satori. It
      does not read JS `fontWeight` keys, so those rendered at 400.
    -->
    <!-- Top: Category badge -->
    <div :style="{ display: 'flex', alignItems: 'center', gap: '12px' }">
      <div
        v-if="category"
        style="font-weight: 500"
        :style="{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 16px',
          backgroundColor: '#0c2d1b',
          border: '1px solid #166534',
          borderRadius: '9999px',
          fontSize: '14px',
          color: '#86efac',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }"
      >
        {{ category }}
      </div>
    </div>

    <!-- Middle: Title + Description -->
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '16px' }">
      <div
        style="font-weight: 800"
        :style="{
          fontSize: '64px',
          color: '#fafafa',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        :style="{
          fontSize: '24px',
          color: '#9d9bab',
          lineHeight: 1.4,
          maxWidth: '800px',
        }"
      >
        {{ description }}
      </div>
    </div>

    <!-- Bottom: Branding -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }"
    >
      <div
        style="font-weight: 700"
        :style="{
          fontSize: '28px',
          color: '#fafafa',
          letterSpacing: '-0.02em',
        }"
      >
        {{ brand }}
      </div>
      <div :style="{ fontSize: '18px', color: '#6b6a7a' }">
        {{ domain }}
      </div>
    </div>
  </div>
</template>
