# @geoql/v-maplibre - Setup Complete

Your v-maplibre package has been successfully configured as an npm package!

## What's Been Set Up

### 1. Package Configuration

- **Package Name**: `@geoql/v-maplibre`
- **Version**: 0.1.0
- **Type**: ES Module with CommonJS support
- **Peer Dependencies**: Vue 3.5.0+
- **Dependencies**: MapLibre GL 5.x, PMTiles 4.x

### 2. Build System

- **Bundler**: Vite 6.x with Rolldown configuration
- **TypeScript**: Full TypeScript support with declaration files
- **Output Formats**: ESM (`dist/index.js`) and CJS (`dist/index.cjs`)
- **CSS**: Bundled CSS at `dist/v-maplibre.css`
- **Source Maps**: Enabled for debugging

### 3. Documentation (Docus)

- **Framework**: Nuxt 3 with Docus theme
- **Location**: `docs/` directory
- **Scripts**:
  - `pnpm docs:dev` - Start docs dev server
  - `pnpm docs:build` - Build static docs
  - `pnpm docs:preview` - Preview built docs

### 4. Workspace Structure

```
v-maplibre/
├── constants/         # Event constants
├── controls/          # Map control components
├── layers/           # Layer components
│   └── maplibre/     # MapLibre-specific layers
├── map/              # Core VMap component
├── markers/          # Marker components
├── popups/           # Popup components
├── utils/            # Utilities & symbols
├── docs/             # Docus documentation site
├── dist/             # Build output (gitignored)
├── index.ts          # Main entry point
├── package.json      # Package configuration
├── vite.config.ts    # Vite build config
├── tsconfig.json     # TypeScript config
└── pnpm-workspace.yaml # pnpm workspace config
```

## Available Scripts

### Development

```bash
pnpm dev              # Start Vite dev server
pnpm build            # Build the library
pnpm preview          # Preview the build
```

### Documentation

```bash
pnpm docs:dev         # Start Docus dev server (port 3000)
pnpm docs:build       # Build static documentation
pnpm docs:preview     # Preview built documentation
```

### Publishing

```bash
pnpm prepublishOnly   # Automatically runs build before publish
npm publish           # Publish to npm (after login)
```

## Next Steps

### 1. Test the Build

```bash
pnpm build
```

### 2. Start Documentation Server

```bash
pnpm docs:dev
```

Visit http://localhost:3000 to see your documentation site.

### 3. Before Publishing

1. **Update package.json**:
   - Set the correct repository URL
   - Update author information
   - Verify version number

2. **Create a GitHub repository** (if not done):

   ```bash
   git remote add origin https://github.com/geoql/v-maplibre.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. **Test locally**:

   ```bash
   pnpm pack
   # Test the generated tarball in another project
   ```

4. **Publish to npm**:
   ```bash
   npm login
   npm publish
   ```

## Package Exports

Your package exports the following:

### Main Entry

```javascript
import { VMap, VMarker, VPopup } from '@geoql/v-maplibre';
import VMap from '@geoql/v-maplibre'; // Default export
```

### Components Available

- **VMap** - Main map component
- **VMarker** - Marker component
- **VPopup** - Popup component
- **Layers**: VLayerMaplibreGeojson, VLayerMaplibreVector, VLayerMaplibreRaster, VLayerMaplibreImage, VLayerMaplibreVideo, VLayerMaplibreCanvas, VLayerMaplibreCluster, VLayerMaplibrePmtile
- **Controls**: VControlAttribution, VControlFullscreen, VControlGeolocate, VControlNavigation, VControlScale

### Styles

```javascript
import '@geoql/v-maplibre/style.css';
// or
import '@geoql/v-maplibre/dist/style.css';
```

## Nuxt 4 Compatibility

The package is compatible with Nuxt 4. Usage:

```vue
<template>
  <ClientOnly>
    <VMap :options="mapOptions"></VMap>
  </ClientOnly>
</template>
```

Create a plugin for styles:

```typescript
// plugins/maplibre.client.ts
import 'maplibre-gl/dist/maplibre-gl.css';
import '@geoql/v-maplibre/style.css';
```

## TypeScript Support

All components are fully typed. Types are automatically available when using the package:

```typescript
import type { MapOptions } from 'maplibre-gl';
import { VMap } from '@geoql/v-maplibre';

const options: MapOptions = {
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
};
```

## Documentation Structure

The docs include:

- **Home page** - Overview and features
- **Getting Started** - Installation and basic usage
- **Examples** - Practical code examples
- **Component Docs**:
  - VMap - Main map component
  - VMarker - Markers and custom markers

You should expand this with:

- Popup component docs
- Layer component docs
- Control component docs
- API reference
- Migration guides
- Advanced examples

## License

MIT License - See LICENSE file

---

**Ready to publish!** 🚀

Built with Vite, Vue 3, TypeScript, and Docus.
