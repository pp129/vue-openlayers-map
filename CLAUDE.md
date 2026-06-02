# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`v-ol-map` — a **Vue 2 (2.7)** component library that wraps **OpenLayers 10**, built with **Vite 3**. It is published to npm as a UMD bundle (`lib/ol-map.umd.js`). There is a separate Vue 3 sibling project (`v3-ol-map`); this repo is Vue 2 only.

The repo doubles as: (1) the publishable library, (2) a Vite demo app of routed examples, and (3) a Storybook gallery. Package manager is **pnpm** (`pnpm-lock.yaml`). Code comments and docs are largely in Chinese.

## Commands

```bash
pnpm dev              # Vite dev server → http://localhost:8888 (auto-opens, has /arcgis proxy)
pnpm build            # Production demo site → dist/ (drops console/debugger)
pnpm build:lib        # Build the npm library → lib/ (UMD) from src/packages/index.js
pnpm lint             # eslint over .js,.vue in src
pnpm lint:fix         # eslint --fix
pnpm storybook        # Storybook 7 → http://localhost:6006
pnpm build-storybook  # Static Storybook → storybook-static/
```

There is **no test framework / no test script**. Verification is manual (dev server + routed examples) or visual (Storybook + Chromatic via `pnpm chromatic`).

The build is driven by Vite `mode` (see `vite.config.js`): `production` builds the demo site, `lib` builds the library (externalizes `vue`/`vue-router`). `pnpm build` runs `--mode production`; `pnpm build:lib` runs `--mode lib`.

## Two parallel component trees — read this before editing

There are two copies of the layer/map components:

- **`src/packages/`** — the **optimized, published** set. `src/packages/index.js` is the library entry point (the `build:lib` entry and the `v-ol-map` / `@/packages` alias both resolve here). Most examples and stories import from `@/packages`. **Edit here for anything that ships in the npm package.** The "packages" tree was created specifically to fix memory leaks and perf issues (see `OPTIMIZATION_*.md`, `src/packages/PERFORMANCE_OPTIMIZATION.md`).
- **`src/components/`** — the **older/full** set, registered via `src/components/index.js`. It contains extras not yet in `packages` (e.g. `traffic`, `gd-route`, `track`, `overviewMap`). The `GdRouteExample` still imports `gd-route` directly from `@/components/layers/gd-route`.

When changing behavior, confirm which tree the consumer imports from before editing. A fix in one tree does **not** propagate to the other.

## Architecture

**Provide/inject is the backbone.** `VMap` (`.../map/index.vue`) constructs the OpenLayers `Map` (via the `OlMap` class in `src/utils/index.js`) and `provide()`s itself as `VMap`. Layer components `inject` `VMap` (and optionally `VGroupLayer`), build an OL layer, and register it through `addLayerToParentComp` (`src/utils/parent.js`), which adds the layer either to the map (`v-map`) or to a layer group (`v-group-layer`). `VMap` only renders its `<slot>` after the map finishes loading (the `load` flag), guaranteeing child layers mount after the map exists.

**`BaseLayer.vue` is a renderless base** (`render() { return null }`). Layer components `extends BaseLayer` to inherit common props (`opacity`, `visible`, `zIndex`, `extent`, `min/maxZoom`, …) and lifecycle cleanup. Its `baseDispose()` tears down event listeners, timers, and rAF handles — subclasses override cleanup but should preserve this.

**Memory/perf management is deliberate, not incidental.** `src/packages/utils/`:
- `eventManager.js` — tracks OL event listener keys so they can be removed on destroy (avoids leaks).
- `performance.js` — `throttle`, `debounce`, `rafThrottle`, LRU cache, batch processor.
- `styleCache.js`, `layerManager.js`.

`VMap` itself throttles `pointermove` (50ms) and routes all OL events through the `EventManager`. Preserve this discipline when adding listeners or timers in any component.

**`src/utils/` holds the non-Vue core:**
- `index.js` (~1470 lines) — the `OlMap` wrapper class **plus** the feature/style helper library: `setFeature`/`setFeatures`, `setStyle`/`setText`, `setPolyline`/`setPolygon`/`setCircle`, `addClusterLayer`, coordinate + GeoJSON/WKT/ESRI conversion, distance/area. Re-exported from `src/packages/index.js` as `utils` and named helpers.
- `path.js` (~1300 lines) — track/path animation engine behind `VPath`.
- `coordtransform.js`, `projConvert.js` — coordinate-system transforms; `cityMap.js` — city→center lookup; `TrafficLayer.js`, `GDRouteFix.js`, `arrowLine.js`, `avoidance.js`.

**Map defaults:** projection `EPSG:4326` (coordinates are `[lng, lat]`), default center `[108.5525, 34.3227]`, zoom 5. Set in the `OlMap` constructor.

## Layout

- `src/main.js` → installs the plugin globally (`Vue.use(olMap)`), mounts the router app.
- `src/router/index.js` — hash-mode routes; each route lazy-loads a page under `src/examples/`.
- `src/examples/*` — routed demo pages (the dev app).
- `src/stories/*` — Storybook stories (`*.stories.js`); examples are imported both rendered and `?raw` for source display.

## Aliases (vite.config.js + jsconfig.json)

- `@` → `src`
- `v-ol-map` → `src/packages/index.js`

## Dev server proxy

`/arcgis` proxies to an internal ArcGIS tile server (`http://172.16.34.120:6080`, rewritten to `…/rest/services/xiamen/MapServer/tile`). Only reachable on that network.
