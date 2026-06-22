# FFaIR IRW Verification Website

This is the codebase for the **FFaIR IRW Verification tool**, developed using [React](https://reactjs.org/) and [Vite](https://vitejs.dev/). It is a spin-off of the WPC [MPD Verification tool](https://www.wpc.ncep.noaa.gov/mpd-verification/), adapted to visualize verification information for **Impactful Rainfall Watches (IRWs)** — MPD-like products issued by forecasters during the WPC Flash Flood and Intense Rainfall (FFaIR) Experiment.

Compared with the MPD site, this version:

- Selects products by **issuance date → forecaster (username) → forecast day (Day 1/2/3) → IRW (by valid time)** rather than by MPD number/year.
- Has **no historical/aggregate statistics** view (interactive map only).
- Has **no product "tag"** and **no product image**.

## Features

- **IRW Selection**: Choose an issuance date, then a forecaster, then a forecast day (Day 1/2/3), then a specific IRW organized by valid time.
- **IRW Info & Statistics**: View per-IRW metadata (forecaster, valid start/end) and available statistics (rain accumulation/rate, Unit Q, ARI).
- **Map Overlays**: Overlay relevant data layers such as LSRs, Stage IV, mPING, USGS, ST4&gt;ARI, ST4&gt;FFG, FFW/FLW.
- **Navigation**: Step through a forecaster's IRWs for the selected day (by valid time) with the prev/next arrows.
- **Share Link**: Generate a link to share a specific IRW view.

## Data

The app reads from the WPC verification mirror at `https://www.wpc.ncep.noaa.gov/verification/FFaIR_MPD/`:

- `Usernames/FFaIR_usernames_and_validtimes_YYYYMMDD.json` — keyed by **issuance date**. Top-level keys are usernames; each value is an array of IRW substrings of the form `day{N}_st{YYYYMMDDHH}_et{YYYYMMDDHH}` (forecast day + valid start/end). See [`test-data/FFaIR_usernames_and_validtimes_20260613.json`](test-data/FFaIR_usernames_and_validtimes_20260613.json) for an example.
- `2026/<LAYER>/` — one folder per data layer (`MPD_contour`, `LSRFLASH`, `LSRREG`, `FFW`, `FLW`, `StageIV`, `ST4gARI`, `ST4gFFG`, `MPING`, `USGS`).
- File naming: `OBSTYPE_20km_2026_USERNAME_SUBSTRING.geojson`, where `SUBSTRING` is the `day{N}_st..._et...` string from the JSON — e.g. `MPD_contour_2026_MDsucks_day1_st2026061518_et2026061600.geojson`. Exceptions: `StageIV`/`FFW`/`FLW` omit `_20km_`, `MPING` uses `_fullday_`, and the IRW outline lives in `MPD_contour/`.

The IRW list for a forecaster/day is read directly from the issuance-date JSON (`fetchUsernamesForDate()` in [`SelectionMenu.jsx`](src/features/SelectionMenu.jsx)) and filtered by the Day 1/2/3 toggle. Boundary overlay vector tiles (CWA/county/RFC/FEMA) are shared with the MPD verification site under `/verification/mpd_verif/overlays/`.

> **Note:** as of this writing the new `FFaIR_usernames_and_validtimes_*` JSONs and the day-prefixed GeoJSONs are not yet published to the live server. For local dev, `vite.config.js` includes a dev-only proxy `bypass` that serves the bundled `test-data` sample for the `2026-06-13` issuance date. Remove that bypass once the real files are published.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm

## Getting Started

```bash
npm install
npm run dev
```

This starts the dev server at `http://localhost:5173`. During development, Vite proxies `/verification/*` to the live WPC mirror (see [`vite.config.js`](vite.config.js)) so the app can fetch data and the `MPD_contour` directory listing without CORS issues.

## Building for Production

```bash
npm run build
```

This generates optimized files in the `dist` directory. In production the app is expected to be served same-origin as the data (under `www.wpc.ncep.noaa.gov`), so no proxy is needed.

## Tech Stack

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **react-map-gl** & **maplibre-gl**: Map rendering and interaction
- **react-select**: Dropdown selection
- **react-datepicker**: Date selection
- **@mui/material**: UI components
- **axios**: HTTP client
- **dayjs**: Date manipulation
- **copy-to-clipboard**: Clipboard copy
