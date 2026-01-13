# Changelog

## [1.3.0](https://github.com/geoql/v-maplibre/compare/v1.2.4...v1.3.0) (2026-01-13)


### Features

* add LiDAR control integration with shadcn theming ([0d8fb0d](https://github.com/geoql/v-maplibre/commit/0d8fb0d3057f826d65bdfb8e8b7ee927932dee3a))
* **v-maplibre:** add _animations/_lighting to ScenegraphLayer, improve example ([dad8b3b](https://github.com/geoql/v-maplibre/commit/dad8b3b3abb536f37792a783ab6554a18a916c6d))


### Bug Fixes

* **mapcn-vue:** fix Quadkey coords, remove Tile3D example (no free datasets work) ([ff1a838](https://github.com/geoql/v-maplibre/commit/ff1a8387e824e7f670a14e7b730baba2df89be92))
* **v-maplibre:** fix ScenegraphLayer and SimpleMeshLayer undefined prop bugs ([212743f](https://github.com/geoql/v-maplibre/commit/212743f6f1ffed2e8cb8b8733adfd36a7fb0052c))
* **v-maplibre:** fix Tile3DLayer undefined loader prop bug, add [@loaders](https://github.com/loaders).gl/3d-tiles ([d9371d0](https://github.com/geoql/v-maplibre/commit/d9371d0ebfed9246c9708f3ccec96f21e0e02590))

## [1.2.4](https://github.com/geoql/v-maplibre/compare/v1.2.3...v1.2.4) (2026-01-11)


### Bug Fixes

* configure jsr.json with npm imports for Deno compatibility ([5d3a73a](https://github.com/geoql/v-maplibre/commit/5d3a73a3cde4f211848fe989069729ff4c5f2320))

## [1.2.3](https://github.com/geoql/v-maplibre/compare/v1.2.2...v1.2.3) (2026-01-11)


### Bug Fixes

* use hardcoded version for maplibre-gl dependency ([ec81514](https://github.com/geoql/v-maplibre/commit/ec815146f68f972ccde3e5699e066642f2eacf4a))

## [1.2.2](https://github.com/geoql/v-maplibre/compare/v1.2.1...v1.2.2) (2026-01-11)


### Miscellaneous

* consolidate to bun, add catalogs for shared deps ([83238e8](https://github.com/geoql/v-maplibre/commit/83238e83c22df82830d8521c565000e553ec2940))
* migrate from release-it to release-please ([3cd7c4c](https://github.com/geoql/v-maplibre/commit/3cd7c4c6e9fb679e2b6dafc99208ed523ed6badb))

## [1.2.1](https://github.com/geoql/v-maplibre/compare/v1.2.0...v1.2.1) (2026-01-07)

### Bug Fixes

- add better-sqlite3 rebuild step for docs build ([444be88](https://github.com/geoql/v-maplibre/commit/444be8853cdf256432e40993cbe670c5eabea8f3))
- add container prop to map components and center layout ([0d2163f](https://github.com/geoql/v-maplibre/commit/0d2163f45e3c899586edcc2e3e1a2bca70f6297c))
- **ci:** add pnpm.onlyBuiltDependencies for better-sqlite3 native module ([7dbcb2e](https://github.com/geoql/v-maplibre/commit/7dbcb2eb11888cf0b9ca2d115d22923f3dbfc484))
- **ci:** add pnpm.onlyBuiltDependencies to docs package.json ([9ca9bbb](https://github.com/geoql/v-maplibre/commit/9ca9bbb2f6f13ac0fbfb5d83323e251b94921a7c))
- **ci:** allow pnpm scripts for native module build ([00b325d](https://github.com/geoql/v-maplibre/commit/00b325d7978e02be348fca7865867b9c63255de8))
- **ci:** build library before mapcn-vue in deploy workflow ([06525f6](https://github.com/geoql/v-maplibre/commit/06525f671372d5ff9edd7eeebb5ade05e41062c9))
- **ci:** build order and native module handling ([a665ec4](https://github.com/geoql/v-maplibre/commit/a665ec46e8761c459270977b73ad199e3b86cded))
- **ci:** correct cloudflare pages output paths and streamline CI flow ([580a655](https://github.com/geoql/v-maplibre/commit/580a655057608d4dc2378c45787a160e8f9a500d))
- **cloudflare:** add nodeCompat option for Workers runtime compatibility ([00cfc3a](https://github.com/geoql/v-maplibre/commit/00cfc3a0ca1317d96b70176bf8851d47c5f51caf))
- **cloudflare:** add nodejs_compat_v2 flag to deploy commands ([6063745](https://github.com/geoql/v-maplibre/commit/6063745a8b596efddc869279a9d3aa5141019309))
- **cloudflare:** add unenv process polyfill for docs ([d2e503e](https://github.com/geoql/v-maplibre/commit/d2e503e78d7a7bd1c8b97531cd66e4dda17bc933))
- **cloudflare:** mock process.stdout to fix CF Workers runtime compatibility ([371f81c](https://github.com/geoql/v-maplibre/commit/371f81c0dc914c51cc0eb28a4a05846f740a6a5d))
- **cloudflare:** try nodejs_compat flag with updated compatibility_date ([e3c8011](https://github.com/geoql/v-maplibre/commit/e3c801180d698800a3918d06abba038f52b4d99a))
- **cloudflare:** use --config flag instead of invalid --compatibility-flags ([353ef02](https://github.com/geoql/v-maplibre/commit/353ef0267dc06325f46bb39d8eb96f6ad2908ce0))
- **demos:** enable map interactivity and fix TypeScript errors ([6db027d](https://github.com/geoql/v-maplibre/commit/6db027df45ffaea04766658ac6a533492853e48d))
- **demos:** fix TypeScript accessor function types for deck.gl layers ([2b785bf](https://github.com/geoql/v-maplibre/commit/2b785bfa30cd5d809497d3ab4595569da28dce73))
- **deploy:** auto-create Pages project if not exists ([4178fe0](https://github.com/geoql/v-maplibre/commit/4178fe083e519b4a0bc2df1dd66c785c7addd126))
- **docs:** correct docs destination URL ([121549f](https://github.com/geoql/v-maplibre/commit/121549f98211a0c7f8c0e17f09c06d2a57bf0aa7))
- **homepage:** reduce demos to 3 to avoid WebGL context limit ([130fab6](https://github.com/geoql/v-maplibre/commit/130fab6afd491f1a42f332b696c5d1c9e6853d92))
- **layout:** use flexbox to keep footer at bottom ([da40c8e](https://github.com/geoql/v-maplibre/commit/da40c8ed76607f207e522acf4f1ea9cf14feb26d))
- **mapcn-vue:** add deck.gl dependencies and cleanup unused demos ([7012352](https://github.com/geoql/v-maplibre/commit/701235286333220fc2d559952a410e5ea8773585))
- **release:** sync version to 1.2.0 and publish from correct directory ([5d2596a](https://github.com/geoql/v-maplibre/commit/5d2596a1389cd48c08d77b08a1c688d7d989e9e3))
- resolve TypeScript errors in HeroMap and tsconfig ([2bcb371](https://github.com/geoql/v-maplibre/commit/2bcb371ac3dff72e6c113f88e1f330685fae0a19))
- update docs lockfile with wrangler dependency ([e968fef](https://github.com/geoql/v-maplibre/commit/e968fef25467331ac0fa7d918328ad5d4ce89b33))
- update registry route and add custom registry config ([3a18583](https://github.com/geoql/v-maplibre/commit/3a18583b26ae2c41d516f865e68342860f4cb4fc))
- updated default layout ([2ae105b](https://github.com/geoql/v-maplibre/commit/2ae105b7c379045eecdbc7b02f66ea67255877e6))
- use `bun` package manager ([cd4913e](https://github.com/geoql/v-maplibre/commit/cd4913ec3be63cb1e1f6320b1c92b7837eb6e980))
- **v-maplibre:** fix async race condition in deck.gl overlay initialization ([7dc3fb4](https://github.com/geoql/v-maplibre/commit/7dc3fb4bf355767d596c59a14b6679616581c553))

### Features

- add gpuAggregation prop to HexagonLayer, use HeatmapLayer for ActiveUsers ([41a2699](https://github.com/geoql/v-maplibre/commit/41a2699e94270487c52e5ee1644a9b194d569844))
- configure Cloudflare Pages deployment with D1 for docs ([88c07ae](https://github.com/geoql/v-maplibre/commit/88c07aef83a033ccb8d6ed6ae3714278a9f02f57))
- **homepage:** redesign with deck.gl demo showcase ([b2f5186](https://github.com/geoql/v-maplibre/commit/b2f51866ed5eb9e7b378a566c439c2665186d3bd))
- **mapcn-vue:** add example pages with CodeBlock component ([ba9806e](https://github.com/geoql/v-maplibre/commit/ba9806ed7e8c1d00c126d7202ecaa5365f57a40b))
- **mapcn-vue:** add plausible analytics and fix component APIs ([97e85f7](https://github.com/geoql/v-maplibre/commit/97e85f7da4ea718c108048d49c2067336adab645))
- **mapcn-vue:** add responsive mobile nav, scroll-spy TOC, and fix package managers ([9f7cb38](https://github.com/geoql/v-maplibre/commit/9f7cb38c031c4cae818148bde7ea46c1be4bfe65))
- restructure to monorepo with mapcn-vue registry ([222e39b](https://github.com/geoql/v-maplibre/commit/222e39bc7e894c6354e1096500d4de8c74add728))

## [1.1.3](/compare/v1.1.2...v1.1.3) (2025-12-13)

### Bug Fixes

- release-it issue with package manager f79f257

## [1.1.2](/compare/v1.1.1...v1.1.2) (2025-11-25)

### Bug Fixes

- css export naming 566af56

## [1.1.1](/compare/v1.1.0...v1.1.1) (2025-11-25)

# 1.1.0 (2025-11-25)

### Bug Fixes

- add signed-off-by in cmt msg aa79c34

### Features

- init 6 💫 05a926d
