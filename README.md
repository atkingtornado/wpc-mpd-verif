# FFaIR IRW Verification Website

This is the codebase for the **FFaIR IRW Verification tool**, developed using [React](https://reactjs.org/) and [Vite](https://vitejs.dev/). It is a spin-off of the WPC [MPD Verification tool](https://www.wpc.ncep.noaa.gov/mpd-verification/), adapted to visualize verification information for **Impactful Rainfall Watches (IRWs)** — MPD-like products issued by forecasters during the WPC Flash Flood and Intense Rainfall (FFaIR) Experiment.

Compared with the MPD site, this version:

- Selects products by **forecaster (username) → valid date → IRW (by valid time)** rather than by MPD number/year.
- Has **no historical/aggregate statistics** view (interactive map only).
- Has **no product "tag"** and **no product image**.

## Features

- **IRW Selection**: Choose a valid date, then a forecaster on duty that day, then a specific IRW organized by valid time.
- **IRW Info & Statistics**: View per-IRW metadata (forecaster, valid start/end) and available statistics (rain accumulation/rate, Unit Q, ARI).
- **Map Overlays**: Overlay relevant data layers such as LSRs, Stage IV, mPING, USGS, ST4&gt;ARI, ST4&gt;FFG, FFW/FLW.
- **Navigation**: Step through a forecaster's IRWs (by valid time) with the prev/next arrows.
- **Share Link**: Generate a link to share a specific IRW view.

## Data

The app reads from the WPC verification mirror at `https://www.wpc.ncep.noaa.gov/verification/FFaIR_MPD/`:

- `Usernames/FFaIR_usernames_YYYYMMDD.json` — the forecaster roster for each day.
- `2026/<LAYER>/` — one folder per data layer (`MPD_contour`, `LSRFLASH`, `LSRREG`, `FFW`, `FLW`, `StageIV`, `ST4gARI`, `ST4gFFG`, `MPING`, `USGS`).
- File naming: `OBSTYPE_20km_2026_USERNAME_BEGIN_END.geojson` (with exceptions: `StageIV`/`FFW`/`FLW` omit `_20km_`, `MPING` uses `_fullday_`, and the IRW outline is `MPD_contour_2026_USERNAME_BEGIN_END.geojson`). `BEGIN`/`END` are `YYYYMMDDHH`.

The list of IRWs for a forecaster/date is enumerated by parsing the flat `2026/MPD_contour/` directory listing once (see `loadIrwIndex()` in [`SelectionMenu.jsx`](src/features/SelectionMenu.jsx)). Boundary overlay vector tiles (CWA/county/RFC/FEMA) are shared with the MPD verification site under `/verification/mpd_verif/overlays/`.

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
