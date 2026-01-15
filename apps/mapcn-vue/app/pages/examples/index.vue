<script setup lang="ts">
  useSeoMeta({
    title: 'Examples - mapcn-vue',
    description: 'Interactive map examples built with mapcn-vue components.',
  });

  interface Example {
    title: string;
    description: string;
    href: string;
    icon: string;
    badge?: string;
  }

  interface Category {
    id: string;
    title: string;
    description: string;
    icon: string;
    examples: Example[];
  }

  const categories: Category[] = [
    {
      id: 'core',
      title: 'MapLibre Core',
      description: 'Essential map components and interactions',
      icon: 'lucide:map',
      examples: [
        {
          title: 'Basic Map',
          description:
            'A simple map with navigation controls and dark mode support.',
          href: '/examples/basic',
          icon: 'lucide:map',
        },
        {
          title: 'Markers & Popups',
          description:
            'Interactive markers with customizable popup information.',
          href: '/examples/markers',
          icon: 'lucide:map-pin',
        },
        {
          title: 'GeoJSON Layer',
          description: 'Render GeoJSON data with styling and interactivity.',
          href: '/examples/geojson',
          icon: 'lucide:shapes',
        },
        {
          title: 'Clustered Points',
          description:
            'Cluster large datasets of points for better performance.',
          href: '/examples/cluster',
          icon: 'lucide:circle-dot',
        },
        {
          title: 'Raster Layer',
          description: 'Display raster tile layers from tile servers.',
          href: '/examples/maplibre-raster',
          icon: 'lucide:image',
        },
        {
          title: 'Image Overlay',
          description: 'Overlay georeferenced images on the map.',
          href: '/examples/maplibre-image',
          icon: 'lucide:image-plus',
        },
        {
          title: 'Video Overlay',
          description: 'Overlay georeferenced video on the map.',
          href: '/examples/maplibre-video',
          icon: 'lucide:video',
          badge: 'Media',
        },
        {
          title: 'Interpolate Heatmap',
          description:
            'IDW interpolated heatmap showing weighted averages, not density.',
          href: '/examples/maplibre-interpolate-heatmap',
          icon: 'lucide:thermometer',
          badge: 'IDW',
        },
        {
          title: 'Delivery Tracking',
          description:
            'Real-time delivery route visualization with labeled markers.',
          href: '/examples/maplibre-route',
          icon: 'lucide:truck',
          badge: 'New',
        },
      ],
    },
    {
      id: 'weather',
      title: 'Weather & Environmental',
      description: 'Meteorological and environmental data visualizations',
      icon: 'lucide:cloud',
      examples: [
        {
          title: 'Wind Animation',
          description:
            'Animated wind particle visualization like Windy.com using GFS data.',
          href: '/examples/wind',
          icon: 'lucide:wind',
          badge: 'Animated',
        },
      ],
    },
    {
      id: 'deckgl-core',
      title: 'deck.gl Core Layers',
      description: 'Fundamental visualization primitives',
      icon: 'lucide:layers',
      examples: [
        {
          title: 'Scatterplot',
          description: 'High-performance scatterplot with millions of points.',
          href: '/examples/deckgl-scatterplot',
          icon: 'lucide:scatter-chart',
          badge: 'Popular',
        },
        {
          title: 'Arc Layer',
          description: 'Origin-destination arc visualization for flow data.',
          href: '/examples/deckgl-arc',
          icon: 'lucide:spline',
        },
        {
          title: 'Line Layer',
          description: 'Simple line segments between point pairs.',
          href: '/examples/deckgl-line',
          icon: 'lucide:minus',
        },
        {
          title: 'Path Layer',
          description: 'Styled polyline paths with width and color.',
          href: '/examples/deckgl-path',
          icon: 'lucide:git-branch',
        },
        {
          title: 'Polygon Layer',
          description: 'Filled and stroked polygon rendering.',
          href: '/examples/deckgl-polygon',
          icon: 'lucide:pentagon',
        },
        {
          title: 'GeoJSON Layer',
          description: 'Render GeoJSON with automatic layer detection.',
          href: '/examples/deckgl-geojson',
          icon: 'lucide:file-json',
        },
        {
          title: 'Column Layer',
          description: '3D columns for categorical or quantitative data.',
          href: '/examples/deckgl-column',
          icon: 'lucide:bar-chart-3',
        },
        {
          title: 'Icon Layer',
          description: 'Custom icons and symbols at point locations.',
          href: '/examples/deckgl-icon',
          icon: 'lucide:image',
        },
        {
          title: 'Text Layer',
          description: 'Text labels with collision detection.',
          href: '/examples/deckgl-text',
          icon: 'lucide:type',
        },
      ],
    },
    {
      id: 'deckgl-aggregation',
      title: 'deck.gl Aggregation',
      description: 'Aggregate and bin large datasets',
      icon: 'lucide:bar-chart-2',
      examples: [
        {
          title: 'Heatmap',
          description: 'Density heatmap visualization for point data.',
          href: '/examples/deckgl-heatmap',
          icon: 'lucide:flame',
          badge: 'Popular',
        },
        {
          title: 'Hexagon Layer',
          description: '3D hexagonal binning for aggregated visualization.',
          href: '/examples/deckgl-hexagon',
          icon: 'lucide:hexagon',
        },
        {
          title: 'Grid Layer',
          description: 'Grid-based aggregation with elevation support.',
          href: '/examples/deckgl-grid',
          icon: 'lucide:grid-3x3',
        },
        {
          title: 'Screen Grid',
          description: 'Screen-space grid aggregation for dense data.',
          href: '/examples/deckgl-screengrid',
          icon: 'lucide:layout-grid',
        },
        {
          title: 'Contour Layer',
          description: 'Contour lines for continuous data visualization.',
          href: '/examples/deckgl-contour',
          icon: 'lucide:mountain',
        },
        {
          title: 'H3 Hexagons',
          description: 'Uber H3 hexagonal hierarchical spatial index.',
          href: '/examples/deckgl-h3',
          icon: 'lucide:hexagon',
          badge: 'Advanced',
        },
      ],
    },
    {
      id: 'deckgl-geo',
      title: 'deck.gl Geo Layers',
      description: 'Geographic and animated visualizations',
      icon: 'lucide:globe',
      examples: [
        {
          title: 'Trips Animation',
          description: 'Animated path visualization for temporal data.',
          href: '/examples/deckgl-trips',
          icon: 'lucide:route',
          badge: 'Animated',
        },
        {
          title: 'Great Circle',
          description: "Geodesic arcs following Earth's curvature.",
          href: '/examples/deckgl-great-circle',
          icon: 'lucide:globe',
        },
        {
          title: 'Terrain Layer',
          description: '3D terrain visualization with elevation data.',
          href: '/examples/deckgl-terrain',
          icon: 'lucide:mountain-snow',
          badge: '3D',
        },
        {
          title: 'WMS Layer',
          description: 'Web Map Service integration for external map data.',
          href: '/examples/deckgl-wms',
          icon: 'lucide:layers-3',
        },
        {
          title: 'MVT Layer',
          description: 'Mapbox Vector Tiles for styled vector data.',
          href: '/examples/deckgl-mvt',
          icon: 'lucide:grid-2x2',
        },
        {
          title: 'Tile Layer',
          description: 'Generic tile loading for raster imagery.',
          href: '/examples/deckgl-tile',
          icon: 'lucide:square-stack',
        },
        {
          title: 'Bitmap Layer',
          description: 'Georeferenced image overlay rendering.',
          href: '/examples/deckgl-bitmap',
          icon: 'lucide:image',
        },
      ],
    },
    {
      id: 'deckgl-raster',
      title: 'deck.gl Raster',
      description: 'Cloud-Optimized GeoTIFF and satellite imagery',
      icon: 'lucide:satellite',
      examples: [
        {
          title: 'COG Layer',
          description: 'GPU-accelerated Cloud-Optimized GeoTIFF visualization.',
          href: '/examples/deckgl-cog',
          icon: 'lucide:satellite',
          badge: 'Sentinel-2',
        },
        {
          title: 'Land Cover COG',
          description: 'NLCD land use classification with automatic colormap.',
          href: '/examples/deckgl-landcover',
          icon: 'lucide:trees',
          badge: 'NLCD',
        },
      ],
    },
    {
      id: 'deckgl-tiles',
      title: 'deck.gl Tile Systems',
      description: 'Spatial indexing with H3, S2, Geohash, and more',
      icon: 'lucide:grid-3x3',
      examples: [
        {
          title: 'Geohash Layer',
          description: 'Visualize data using Geohash spatial indexing.',
          href: '/examples/deckgl-geohash',
          icon: 'lucide:hash',
        },
        {
          title: 'Quadkey Layer',
          description: 'Bing Maps Quadkey tile visualization.',
          href: '/examples/deckgl-quadkey',
          icon: 'lucide:square-code',
        },
        {
          title: 'S2 Layer',
          description: 'Google S2 geometry spherical cells.',
          href: '/examples/deckgl-s2',
          icon: 'lucide:globe-2',
        },
        {
          title: 'H3 Cluster',
          description: 'Clustered H3 hexagon regions.',
          href: '/examples/deckgl-h3-cluster',
          icon: 'lucide:hexagon',
        },
        {
          title: 'Grid Cell',
          description: 'Pre-aggregated grid cell visualization.',
          href: '/examples/deckgl-grid-cell',
          icon: 'lucide:layout-grid',
        },
      ],
    },
    {
      id: 'deckgl-3d',
      title: 'deck.gl 3D Layers',
      description: '3D models, point clouds, and mesh rendering',
      icon: 'lucide:box',
      examples: [
        {
          title: 'Scenegraph',
          description: 'glTF/GLB 3D model rendering.',
          href: '/examples/deckgl-scenegraph',
          icon: 'lucide:plane',
          badge: '3D',
        },
        {
          title: 'Simple Mesh',
          description: 'Instanced 3D mesh objects on the map.',
          href: '/examples/deckgl-simple-mesh',
          icon: 'lucide:box',
          badge: '3D',
        },
        {
          title: 'Point Cloud',
          description: 'LiDAR and photogrammetry point clouds.',
          href: '/examples/deckgl-point-cloud',
          icon: 'lucide:cloud',
          badge: '3D',
        },
        {
          title: 'LiDAR Viewer',
          description:
            'Load LAS/LAZ/COPC files with streaming and classification.',
          href: '/examples/lidar',
          icon: 'lucide:radar',
          badge: 'LiDAR',
        },
        {
          title: 'Solid Polygon',
          description: '3D extruded solid polygon buildings.',
          href: '/examples/deckgl-solid-polygon',
          icon: 'lucide:building-2',
          badge: '3D',
        },
      ],
    },
  ];

  const totalExamples = computed(() =>
    categories.reduce((sum, cat) => sum + cat.examples.length, 0),
  );
</script>

<template>
  <div class="relative min-h-dvh">
    <!-- Animated mesh gradient background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-background"></div>
      <!-- Aurora gradient blobs -->
      <div
        class="absolute -left-[40%] -top-[30%] h-[80%] w-[80%] animate-aurora-1 rounded-full bg-linear-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
      ></div>
      <div
        class="absolute -right-[30%] top-[20%] h-[60%] w-[60%] animate-aurora-2 rounded-full bg-linear-to-bl from-violet-500/15 via-primary/10 to-transparent blur-3xl"
      ></div>
      <div
        class="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] animate-aurora-3 rounded-full bg-linear-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
      ></div>
      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgb(128_128_128/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgb(128_128_128/0.03)_1px,transparent_1px)] bg-size-[60px_60px]"
      ></div>
      <!-- Noise texture overlay -->
      <div
        class="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style="
          background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.65&quot; numOctaves=&quot;3&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');
        "
      ></div>
    </div>

    <div class="container max-w-screen-2xl py-12 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-4">
        <!-- Header Section -->
        <div class="mb-16 text-center">
          <!-- Glowing accent line -->
          <div
            class="animate-fade-in mx-auto mb-8 h-px w-32 bg-linear-to-r from-transparent via-primary to-transparent"
          ></div>

          <div
            class="animate-fade-up mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-wide text-primary backdrop-blur-sm"
          >
            <Icon name="lucide:sparkles" class="h-3.5 w-3.5"></Icon>
            <span>{{ totalExamples }} Interactive Examples</span>
          </div>

          <h1
            class="animate-fade-up delay-100 mb-6 bg-linear-to-b from-foreground via-foreground to-foreground/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl"
          >
            Explore Examples
          </h1>

          <p
            class="animate-fade-up delay-200 mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            Discover what's possible with mapcn-vue. From basic maps to advanced
            <span class="text-foreground">WebGL visualizations</span> — each
            example is interactive and ready to use.
          </p>

          <!-- Quick stats -->
          <div
            class="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-8 text-sm"
          >
            <div class="flex items-center gap-2 text-muted-foreground">
              <div
                class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
              ></div>
              <span>All examples are interactive</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:moon" class="h-4 w-4"></Icon>
              <span>Dark mode ready</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Icon name="lucide:zap" class="h-4 w-4"></Icon>
              <span>WebGL accelerated</span>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="space-y-20">
          <section
            v-for="(category, categoryIndex) in categories"
            :key="category.id"
            class="animate-fade-up"
            :style="{ animationDelay: `${400 + categoryIndex * 100}ms` }"
          >
            <!-- Category Header -->
            <div class="mb-8 flex items-center gap-4">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm"
              >
                <Icon :name="category.icon" class="h-6 w-6 text-primary"></Icon>
              </div>
              <div>
                <h2 class="text-2xl font-semibold tracking-tight">
                  {{ category.title }}
                </h2>
                <p class="text-sm text-muted-foreground">
                  {{ category.description }}
                </p>
              </div>
              <div
                class="ml-auto hidden h-px flex-1 bg-linear-to-r from-border to-transparent md:block"
              ></div>
              <div
                class="hidden rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-muted-foreground md:block"
              >
                {{ category.examples.length }} examples
              </div>
            </div>

            <!-- Example Cards Grid -->
            <div
              class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <NuxtLink
                v-for="(example, exampleIndex) in category.examples"
                :key="example.href"
                :to="example.href"
                class="example-card group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
                :style="{
                  animationDelay: `${500 + categoryIndex * 100 + exampleIndex * 50}ms`,
                }"
              >
                <!-- Hover glow effect -->
                <div
                  class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <div
                    class="absolute -inset-px rounded-xl bg-linear-to-b from-primary/10 via-transparent to-transparent"
                  ></div>
                </div>

                <!-- Badge -->
                <div
                  v-if="example.badge"
                  class="absolute right-3 top-3 rounded-full bg-linear-to-r from-primary/90 to-violet-500/90 px-2 py-0.5 text-[10px] font-medium text-white"
                >
                  {{ example.badge }}
                </div>

                <!-- Icon -->
                <div
                  class="relative mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border/50 bg-muted/50 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10"
                >
                  <Icon
                    :name="example.icon"
                    class="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                  ></Icon>
                </div>

                <!-- Content -->
                <h3
                  class="relative mb-2 font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary"
                >
                  {{ example.title }}
                </h3>
                <p
                  class="relative text-sm leading-relaxed text-muted-foreground"
                >
                  {{ example.description }}
                </p>

                <!-- Arrow indicator -->
                <div
                  class="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2"
                >
                  <Icon
                    name="lucide:arrow-right"
                    class="h-4 w-4 text-primary"
                  ></Icon>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>

        <!-- Footer CTA -->
        <div class="mt-24 text-center">
          <div
            class="animate-fade-in mx-auto inline-flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card/30 px-8 py-10 backdrop-blur-md sm:px-12"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10"
            >
              <Icon name="lucide:code-2" class="h-7 w-7 text-primary"></Icon>
            </div>
            <div class="max-w-md space-y-2">
              <h3 class="text-xl font-semibold tracking-tight">
                Ready to build?
              </h3>
              <p class="text-sm text-muted-foreground">
                Add any component to your project with a single CLI command.
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <NuxtLink
                to="/docs/introduction"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Get Started
                <Icon name="lucide:arrow-right" class="h-4 w-4"></Icon>
              </NuxtLink>
              <a
                href="https://github.com/geoql/v-maplibre"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 px-5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground"
              >
                <Icon name="lucide:github" class="h-4 w-4"></Icon>
                View Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
